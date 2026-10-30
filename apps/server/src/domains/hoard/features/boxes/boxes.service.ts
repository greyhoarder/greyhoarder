import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { type Box, boxKitName, type Mini, newBoxes, parseTags, toKit } from '@greyhoarder/domain/hoard';
import { CatalogKitQueries, findContainedKits } from '../../../catalog/api/index.js';
import { nextBoxNumber } from '../../models/box-numbers.js';
import { droppedFactions } from '../../models/dropped-factions.js';
import { droppedParts } from '../../models/dropped-parts.js';
import { withoutDeletedRecipients } from '../../models/mini-deletion.js';
import { HoardRepository } from '../../ports/hoard-repository.js';
import { UnknownBoxError } from './errors/unknown-box.error.js';
import { UnknownKitError } from '../../models/errors/unknown-kit.error.js';

export interface BoxList {
  readonly boxes: readonly Box[];
  /** The names of the catalog factions the boxes refer to, by id. */
  readonly factionNames: ReadonlyMap<string, string>;
}

/** What the user asked for: how many boxes of which catalog kit, with which tags, added on which day. */
export interface BoxesOfKit {
  readonly kitId: string;
  readonly boxes: number;
  readonly tags: readonly string[];
  /** ISO date, e.g. "2026-10-12". */
  readonly addedOn: string;
}

export interface AddedBoxes {
  readonly boxes: readonly Box[];
  readonly minis: readonly Mini[];
}

/** What deleting a box took with it. */
export interface BoxDeletion {
  /** Its minis, gone ones included. */
  readonly deletedMiniIds: readonly string[];
  /** Other minis whose recipients lost the deleted ones. */
  readonly minis: readonly Mini[];
}

/** The boxes of the signed-in user's hoard: listing them, adding boxes of a catalog kit, deleting a box. */
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
   * Boxes of the kit's latest version with the minis it puts on the sprue (docs/domains/hoard.md).
   *
   * @throws UnknownKitError when the catalog does not offer the kit
   * @throws EmptyBoxError when the kit puts no minis on the sprue
   */
  async add(ownerId: string, request: BoxesOfKit): Promise<AddedBoxes> {
    const [found] = await this.catalog.findKits([request.kitId]);
    if (found === undefined || found.isRemoved) {
      throw new UnknownKitError(request.kitId);
    }
    const containedKits = await findContainedKits([found], (ids) => this.catalog.findKits(ids));
    const kit = toKit(
      { ...found.entry, version: found.version },
      new Map(containedKits.map(({ entry, version }) => [entry.id, { ...entry, version }])),
    );
    const { boxes, minis } = newBoxes(
      kit,
      { boxes: request.boxes, tags: parseTags(request.tags) },
      {
        addedOn: request.addedOn,
        newId: randomUUID,
        firstNumber: nextBoxNumber(await this.hoard.findBoxes(ownerId), boxKitName(kit)),
      },
    );
    await this.hoard.addBoxes(ownerId, boxes, minis);
    return { boxes, minis };
  }

  /**
   * Deletes the box and all its minis for good, gone ones included, and takes them out of the
   * recipients of other minis' parts; all or nothing (docs/domains/hoard.md, Boxes and kits).
   *
   * @throws UnknownBoxError when the box is not in the owner's hoard
   */
  async delete(ownerId: string, boxId: string): Promise<BoxDeletion> {
    const boxes = await this.hoard.findBoxes(ownerId);
    if (!boxes.some((box) => box.id === boxId)) {
      throw new UnknownBoxError();
    }
    const all = await this.hoard.findMinis(ownerId);
    const minisOfBox = all.filter((mini) => mini.boxId === boxId);
    const deleted = new Set(minisOfBox.map((mini) => mini.id));
    const changed = withoutDeletedRecipients(
      all.filter((mini) => !deleted.has(mini.id)),
      deleted,
    );
    const deletedMiniIds = await this.hoard.deleteBox(ownerId, boxId, {
      changed,
      droppedPartIds: droppedParts(minisOfBox, []),
      droppedFactionIds: droppedFactions(minisOfBox, []),
    });
    return { deletedMiniIds, minis: changed };
  }
}
