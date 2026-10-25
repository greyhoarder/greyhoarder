import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { type Box, type Mini, newBoxes, parseTags, toKit } from '@greyhoarder/domain/hoard';
import { CatalogKitQueries, findContainedKits } from '../../../catalog/api/index.js';
import { HoardRepository } from '../../ports/hoard-repository.js';
import { UnknownKitError } from './errors/unknown-kit.error.js';

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

/** The boxes of the signed-in user's hoard: listing them, and adding boxes of a catalog kit. */
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
      { addedOn: request.addedOn, newId: randomUUID },
    );
    await this.hoard.addBoxes(ownerId, boxes, minis);
    return { boxes, minis };
  }
}
