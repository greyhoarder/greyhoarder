import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import type { CatalogKit } from '@greyhoarder/domain/catalog';
import {
  type Box,
  type BoxKitReference,
  boxKitName,
  editedRows,
  type Kit,
  type Mini,
  newBoxes,
  parseTags,
  toKit,
} from '@greyhoarder/domain/hoard';
import { CatalogKitQueries, findContainedKits, type VersionedEntry } from '../../../catalog/api/index.js';
import { boxDeletion } from '../../models/box-deletion.js';
import { nextBoxNumber } from '../../models/box-numbers.js';
import { droppedFactions } from '../../models/dropped-factions.js';
import { droppedParts } from '../../models/dropped-parts.js';
import { withoutDeletedRecipients } from '../../models/mini-deletion.js';
import { HoardRepository } from '../../ports/hoard-repository.js';
import { BoxWithoutKitError } from './errors/box-without-kit.error.js';
import { UnknownBoxError } from './errors/unknown-box.error.js';
import { UnknownKitError } from '../../models/errors/unknown-kit.error.js';

export interface BoxList {
  readonly boxes: readonly Box[];
  /** The names of the catalog factions the boxes refer to, by id. */
  readonly factionNames: ReadonlyMap<string, string>;
}

/**
 * What the user asked for: how many boxes of which catalog kit, with which tags, added on which day,
 * and optionally under which name, with how many minis per row and whether they are sprues.
 */
export interface BoxesOfKit {
  readonly kitId: string;
  readonly boxes: number;
  readonly tags: readonly string[];
  /** ISO date, e.g. "2026-10-12". */
  readonly addedOn: string;
  readonly name?: string;
  readonly rows?: readonly number[];
  readonly areSprues?: boolean;
}

export interface AddedBoxes {
  readonly boxes: readonly Box[];
  readonly minis: readonly Mini[];
}

/** What deleting a box took with it. */
export interface BoxDeletion {
  /** Its minis deleted with it, gone ones included. */
  readonly deletedMiniIds: readonly string[];
  /** Other minis that changed: kept ones now without a box, and those whose recipients lost deleted ones. */
  readonly minis: readonly Mini[];
}

/** A box with its minis on the sprue counted anew. */
export interface EditedBox {
  readonly box: Box;
  readonly addedMinis: readonly Mini[];
  readonly deletedMiniIds: readonly string[];
  /** Other minis that no longer name a deleted mini as a recipient of their parts. */
  readonly minis: readonly Mini[];
}

/**
 * The boxes of the signed-in user's hoard: listing them, adding boxes of a catalog kit, counting the
 * minis on the sprue of a box anew, deleting a box.
 */
@Injectable()
export class BoxesService {
  constructor(
    private readonly hoard: HoardRepository,
    private readonly catalog: CatalogKitQueries,
  ) {}

  async list(ownerId: string): Promise<BoxList> {
    const boxes = await this.hoard.findBoxes(ownerId);
    const factionNames = await this.catalog.findFactionNames([...new Set(boxes.flatMap((box) => box.factionIds))]);
    return { boxes, factionNames };
  }

  /**
   * Boxes of the kit's latest version with the minis of the counted rows on the sprue, numbered after
   * the boxes of their name (docs/domains/hoard.md).
   *
   * @throws UnknownKitError when the catalog does not offer the kit
   * @throws EmptyBoxError when the rows put no minis on the sprue
   * @throws InvalidRowsError when the rows do not fit the kit
   */
  async add(ownerId: string, request: BoxesOfKit): Promise<AddedBoxes> {
    const [found] = await this.catalog.findKits([request.kitId]);
    if (found === undefined || found.isRemoved) {
      throw new UnknownKitError(request.kitId);
    }
    const kit = await this.toKit(found);
    const name = request.name ?? boxKitName(kit);
    const { boxes, minis } = newBoxes(
      kit,
      {
        boxes: request.boxes,
        tags: parseTags(request.tags),
        name,
        rows: request.rows,
        areSprues: request.areSprues,
      },
      {
        addedOn: request.addedOn,
        newId: randomUUID,
        firstNumber: nextBoxNumber(await this.hoard.findBoxes(ownerId), name),
      },
    );
    await this.hoard.addBoxes(ownerId, boxes, minis);
    return { boxes, minis };
  }

  /**
   * Counts the minis on the sprue of the box anew, row by row of the kit version it records: adds or
   * deletes minis on the sprue and marks the box as edited, all or nothing (docs/domains/hoard.md,
   * Boxes and kits).
   *
   * @throws UnknownBoxError when the box is not in the owner's hoard
   * @throws BoxWithoutKitError when the box records no kit
   * @throws UnknownKitError when the catalog has no such version of the kit
   * @throws InvalidRowsError when the rows do not fit the kit
   */
  async editRows(ownerId: string, boxId: string, rows: readonly number[]): Promise<EditedBox> {
    const box = (await this.hoard.findBoxes(ownerId)).find((candidate) => candidate.id === boxId);
    if (box === undefined) {
      throw new UnknownBoxError();
    }
    if (box.kit === undefined) {
      throw new BoxWithoutKitError();
    }
    const kit = await this.kitOfBox(box.kit);
    const all = await this.hoard.findMinis(ownerId);
    const edited = editedRows(
      kit,
      box,
      all.filter((mini) => mini.boxId === boxId),
      rows,
      randomUUID,
    );
    const deleted = new Set(edited.deletedIds);
    const deletedMinis = all.filter((mini) => deleted.has(mini.id));
    const changed = withoutDeletedRecipients(
      all.filter((mini) => !deleted.has(mini.id)),
      deleted,
    );
    await this.hoard.editBoxRows(ownerId, edited.box, edited.added, edited.deletedIds, {
      changed,
      droppedPartIds: droppedParts(deletedMinis, []),
      droppedFactionIds: droppedFactions(deletedMinis, []),
    });
    return { box: edited.box, addedMinis: edited.added, deletedMiniIds: edited.deletedIds, minis: changed };
  }

  /** The kit in the version the box records, with the latest kits it contains. */
  private async kitOfBox(reference: BoxKitReference): Promise<Kit> {
    const found = await this.catalog.findKitVersion(reference.id, reference.version);
    if (found === undefined) {
      throw new UnknownKitError(reference.id);
    }
    return this.toKit(found);
  }

  private async toKit(found: VersionedEntry<CatalogKit>): Promise<Kit> {
    const containedKits = await findContainedKits([found], (ids) => this.catalog.findKits(ids));
    return toKit(
      { ...found.entry, version: found.version },
      new Map(containedKits.map(({ entry, version }) => [entry.id, { ...entry, version }])),
    );
  }

  /**
   * Deletes the box and all its minis for good, gone ones included, or only those on the sprue when
   * the others are kept: they stay without a box, with its kit. Takes the deleted minis out of the
   * recipients of other minis' parts; all or nothing (docs/domains/hoard.md, Boxes and kits).
   *
   * @throws UnknownBoxError when the box is not in the owner's hoard
   */
  async delete(
    ownerId: string,
    boxId: string,
    options: { readonly keepBuiltMinis?: boolean } = {},
  ): Promise<BoxDeletion> {
    const box = (await this.hoard.findBoxes(ownerId)).find((candidate) => candidate.id === boxId);
    if (box === undefined) {
      throw new UnknownBoxError();
    }
    const all = await this.hoard.findMinis(ownerId);
    const { deleted, kept } = boxDeletion(
      box,
      all.filter((mini) => mini.boxId === boxId),
      { keepBuiltMinis: options.keepBuiltMinis === true },
    );
    const deletedIds = new Set(deleted.map((mini) => mini.id));
    const keptById = new Map(kept.map((mini) => [mini.id, mini]));
    const staying = all.filter((mini) => !deletedIds.has(mini.id)).map((mini) => keptById.get(mini.id) ?? mini);
    const changed = withoutDeletedRecipients(staying, deletedIds);
    const changedIds = new Set(changed.map((mini) => mini.id));
    const deletedMiniIds = await this.hoard.deleteBox(ownerId, boxId, {
      changed,
      keptMinis: kept,
      droppedPartIds: droppedParts(deleted, []),
      droppedFactionIds: droppedFactions(deleted, []),
    });
    return { deletedMiniIds, minis: [...kept.filter((mini) => !changedIds.has(mini.id)), ...changed] };
  }
}
