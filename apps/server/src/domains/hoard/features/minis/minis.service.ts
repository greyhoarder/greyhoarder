import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import {
  type BoxKitReference,
  type Departure,
  type HobbyStatus,
  kitReferenceOf,
  type Mini,
  parseDeparture,
  parseMini,
  toKit,
  withDeparture,
  withStatus,
} from '@greyhoarder/domain/hoard';
import { CatalogKitQueries } from '../../../catalog/api/index.js';
import { type LooseMinis, looseMinis } from '../../models/loose-minis.js';
import { emptiedBoxIds, withoutDeletedRecipients } from '../../models/mini-deletion.js';
import { droppedParts } from '../../models/dropped-parts.js';
import { UnknownKitError } from '../../models/errors/unknown-kit.error.js';
import { type PartChange, resolveParts } from '../../models/part-changes.js';
import { HoardRepository } from '../../ports/hoard-repository.js';
import { UnknownMinisError } from './errors/unknown-minis.error.js';
import { UnknownFactionError } from './errors/unknown-faction.error.js';

export interface MiniList {
  readonly minis: readonly Mini[];
  /** The names of the catalog factions the minis refer to, by id. */
  readonly factionNames: ReadonlyMap<string, string>;
  /** The names of the game systems of those factions, by faction id. */
  readonly systemNames: ReadonlyMap<string, string>;
}

/** What to change on every given mini alike; left out means unchanged. */
export interface MiniChanges {
  readonly name?: string;
  readonly status?: HobbyStatus;
  readonly factionIds?: readonly string[];
  readonly parts?: readonly PartChange[];
  readonly notes?: string;
  readonly isOnWorkbench?: boolean;
  /** Lets the minis leave the hoard; `null` brings them back. */
  readonly departure?: Departure | null;
}

/** Alike minis to add without a box; parts as in changes. */
export type MinisToAdd = Omit<LooseMinis, 'parts' | 'kit'> & {
  readonly parts: readonly PartChange[];
  /** The catalog kit in the version the search found. */
  readonly kit?: { readonly id: string; readonly version: number };
};

/** What deleting minis changed besides them. */
export interface MinisDeletion {
  /** The boxes left without any minis, gone ones included; they stay. */
  readonly emptiedBoxIds: readonly string[];
  /** Other minis that no longer name the deleted ones as recipients of their parts. */
  readonly minis: readonly Mini[];
}

/** The minis of the signed-in user's hoard: listing them, adding them without a box and changing several alike at once. */
@Injectable()
export class MinisService {
  constructor(
    private readonly hoard: HoardRepository,
    private readonly catalog: CatalogKitQueries,
  ) {}

  async list(ownerId: string): Promise<MiniList> {
    const minis = await this.hoard.findMinis(ownerId);
    const factionIds = [...new Set(minis.flatMap((mini) => mini.factionIds))];
    const [factionNames, systemNames] = await Promise.all([
      this.catalog.findFactionNames(factionIds),
      this.catalog.findSystemNames(factionIds),
    ]);
    return { minis, factionNames, systemNames };
  }

  /**
   * Adds alike minis without a box, adding part names the vocabulary does not know to it; all or
   * nothing. Whether the name is one of the catalog is not checked: kits only suggest.
   *
   * @throws UnknownPartError when a part refers to an id that is not in the owner's vocabulary
   * @throws UnknownFactionError when a faction is neither a catalog faction nor a game system
   * @throws UnknownKitError when the catalog has no such version of the kit
   */
  async add(ownerId: string, minis: MinisToAdd): Promise<Mini[]> {
    await this.checkFactions(minis.factionIds);
    const { kit: wanted, ...alike } = minis;
    const kit = wanted && (await this.kitReference(wanted));
    const { parts, newParts } = resolveParts(await this.hoard.findParts(ownerId), minis.parts, randomUUID);
    const added = looseMinis({ ...alike, parts, ...(kit ? { kit } : {}) }, randomUUID);
    await this.hoard.addMinis(ownerId, added, newParts);
    return added;
  }

  /** The kit in that version, as a box records it. */
  private async kitReference({
    id,
    version,
  }: {
    readonly id: string;
    readonly version: number;
  }): Promise<BoxKitReference> {
    const found = await this.catalog.findKitVersion(id, version);
    if (found === undefined) {
      throw new UnknownKitError(id);
    }
    return kitReferenceOf(toKit({ ...found.entry, version: found.version }, new Map()));
  }

  /**
   * Applies the changes to every mini, adding part names the vocabulary does not know to it;
   * all or nothing.
   *
   * @throws UnknownMinisError when a mini is not in the owner's hoard
   * @throws UnknownPartError when a part refers to an id that is not in the owner's vocabulary
   * @throws UnknownFactionError when a faction is neither a catalog faction nor a game system
   */
  async update(ownerId: string, ids: readonly string[], changes: MiniChanges): Promise<Mini[]> {
    const uniqueIds = [...new Set(ids)];
    const minis = await this.hoard.findMinisByIds(ownerId, uniqueIds);
    if (minis.length !== uniqueIds.length) {
      throw new UnknownMinisError();
    }
    if (changes.factionIds) {
      await this.checkFactions(changes.factionIds);
    }
    const departure =
      changes.departure && (await this.checkDeparture(ownerId, uniqueIds, changes.departure));
    const { parts, status, departure: _checked, ...rest } = changes;
    const resolved = parts && resolveParts(await this.hoard.findParts(ownerId), parts, randomUUID);
    const changed = minis.map((mini) => {
      let next: Mini = { ...mini, ...rest, ...(resolved ? { parts: resolved.parts } : {}) };
      next = status === undefined ? next : withStatus(next, status);
      next = departure === undefined ? next : withDeparture(next, departure ?? undefined);
      return parseMini(next);
    });
    await this.hoard.updateMinis(ownerId, {
      changed,
      newParts: resolved?.newParts ?? [],
      droppedPartIds: droppedParts(minis, changed),
    });
    return changed;
  }

  /**
   * Deletes the minis for good and takes them out of the recipients of other minis' parts, all or
   * nothing; their boxes stay, also when they have no minis left.
   *
   * @throws UnknownMinisError when a mini is not in the owner's hoard
   */
  async delete(ownerId: string, ids: readonly string[]): Promise<MinisDeletion> {
    const deleted = new Set(ids);
    const all = await this.hoard.findMinis(ownerId);
    const minis = all.filter((mini) => deleted.has(mini.id));
    if (minis.length !== deleted.size) {
      throw new UnknownMinisError();
    }
    const staying = all.filter((mini) => !deleted.has(mini.id));
    const changed = withoutDeletedRecipients(staying, deleted);
    await this.hoard.deleteMinis(ownerId, [...deleted], { changed, droppedPartIds: droppedParts(minis, []) });
    return { emptiedBoxIds: emptiedBoxIds(minis, staying), minis: changed };
  }

  /**
   * A departure by the rules whose recipients are other minis of the owner's hoard.
   *
   * @throws UnknownMinisError when a recipient is not in the owner's hoard or is one of the minis
   */
  private async checkDeparture(
    ownerId: string,
    ids: readonly string[],
    departure: Departure,
  ): Promise<Departure> {
    const parsed = parseDeparture(departure);
    const recipientIds = parsed.recipientMiniIds ?? [];
    if (recipientIds.length === 0) {
      return parsed;
    }
    const recipients = await this.hoard.findMinisByIds(ownerId, recipientIds);
    if (recipients.length !== recipientIds.length || recipientIds.some((id) => ids.includes(id))) {
      throw new UnknownMinisError();
    }
    return parsed;
  }

  /** Factions are references into the catalog: catalog factions or whole game systems. */
  private async checkFactions(factionIds: readonly string[]): Promise<void> {
    const known = await this.catalog.findFactionNames(factionIds);
    if (factionIds.some((id) => !known.has(id))) {
      throw new UnknownFactionError();
    }
  }
}
