import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import {
  type BoxKitReference,
  type Departure,
  type HobbyStatus,
  isOwnFaction,
  kitReferenceOf,
  type Mini,
  type OwnFaction,
  parseDeparture,
  parseMini,
  toKit,
  withDeparture,
  withStatus,
} from '@greyhoarder/domain/hoard';
import { CatalogKitQueries, findFactionLineage } from '../../../catalog/api/index.js';
import { type LooseMinis, looseMinis } from '../../models/loose-minis.js';
import { ownFactionNamesOf } from '../../models/own-faction-names.js';
import { emptiedBoxIds, withoutDeletedRecipients } from '../../models/mini-deletion.js';
import { droppedFactions } from '../../models/dropped-factions.js';
import { droppedParts } from '../../models/dropped-parts.js';
import { type FactionChange, resolveFactions } from '../../models/faction-changes.js';
import { NameTakenMeanwhileError } from '../../models/errors/name-taken-meanwhile.error.js';
import { UnknownKitError } from '../../models/errors/unknown-kit.error.js';
import { type PartChange, resolveParts } from '../../models/part-changes.js';
import { HoardRepository } from '../../ports/hoard-repository.js';
import { UnknownMinisError } from './errors/unknown-minis.error.js';
import { UnknownFactionError } from './errors/unknown-faction.error.js';

export interface MiniList {
  readonly minis: readonly Mini[];
  /** The names of the factions the minis refer to, by id: catalog factions and the owner's own. */
  readonly factionNames: ReadonlyMap<string, string>;
  /** The names of the game systems of the catalog factions, by faction id. */
  readonly systemNames: ReadonlyMap<string, string>;
  /**
   * The catalog faction each of the minis' catalog factions is part of, up the whole chain, by
   * faction id; the names of those factions are in `factionNames` as well.
   */
  readonly partOf: ReadonlyMap<string, string>;
}

/** Minis as a change stored them. */
export interface ChangedMinis {
  readonly minis: readonly Mini[];
  /** The names of the owner's own factions the minis carry, by id. */
  readonly ownFactionNames: ReadonlyMap<string, string>;
}

/** What to change on every given mini alike; left out means unchanged. */
export interface MiniChanges {
  readonly name?: string;
  readonly status?: HobbyStatus;
  readonly factions?: readonly FactionChange[];
  readonly parts?: readonly PartChange[];
  readonly notes?: string;
  readonly isOnWorkbench?: boolean;
  /** Lets the minis leave the hoard; `null` brings them back. */
  readonly departure?: Departure | null;
}

/** Alike minis to add without a box; factions and parts as in changes. */
export type MinisToAdd = Omit<LooseMinis, 'factionIds' | 'parts' | 'kit'> & {
  readonly factions: readonly FactionChange[];
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
    const factionIds = [...new Set(minis.flatMap((mini) => mini.factionIds))].filter((id) => !isOwnFaction(id));
    const partOf = await findFactionLineage(factionIds, (ids) => this.catalog.findFactions(ids));
    const catalogIds = [...new Set([...factionIds, ...partOf.values()])];
    const [catalogNames, systemNames, ownFactions] = await Promise.all([
      this.catalog.findFactionNames(catalogIds),
      this.catalog.findSystemNames(catalogIds),
      this.hoard.findOwnFactions(ownerId),
    ]);
    return {
      minis,
      factionNames: new Map([...catalogNames, ...ownFactionNamesOf(minis, ownFactions)]),
      systemNames,
      partOf,
    };
  }

  /**
   * Adds alike minis without a box, adding part names the vocabulary does not know to it and faction
   * names to the owner's own factions; all or nothing. Whether the name is one of the catalog is not
   * checked: kits only suggest.
   *
   * @throws UnknownPartError when a part refers to an id that is not in the owner's vocabulary
   * @throws UnknownFactionError when a faction is neither a catalog faction, a game system nor one of the owner's own
   * @throws UnknownKitError when the catalog has no such version of the kit
   */
  add(ownerId: string, minis: MinisToAdd): Promise<Mini[]> {
    return againIfNameTaken(() => this.tryAdd(ownerId, minis));
  }

  private async tryAdd(ownerId: string, minis: MinisToAdd): Promise<Mini[]> {
    const { factionIds, newFactions } = await this.resolveFactions(ownerId, minis.factions);
    const { kit: wanted, factions: _resolved, ...alike } = minis;
    const kit = wanted && (await this.kitReference(wanted));
    const { parts, newParts } = resolveParts(await this.hoard.findParts(ownerId), minis.parts, randomUUID);
    const added = looseMinis({ ...alike, factionIds, parts, ...(kit ? { kit } : {}) }, randomUUID);
    await this.hoard.addMinis(ownerId, added, { newParts, newFactions });
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
   * Applies the changes to every mini, adding part names the vocabulary does not know to it and
   * faction names to the owner's own factions; all or nothing.
   *
   * @throws UnknownMinisError when a mini is not in the owner's hoard
   * @throws UnknownPartError when a part refers to an id that is not in the owner's vocabulary
   * @throws UnknownFactionError when a faction is neither a catalog faction, a game system nor one of the owner's own
   */
  update(ownerId: string, ids: readonly string[], changes: MiniChanges): Promise<ChangedMinis> {
    return againIfNameTaken(() => this.tryUpdate(ownerId, ids, changes));
  }

  private async tryUpdate(ownerId: string, ids: readonly string[], changes: MiniChanges): Promise<ChangedMinis> {
    const uniqueIds = [...new Set(ids)];
    const minis = await this.hoard.findMinisByIds(ownerId, uniqueIds);
    if (minis.length !== uniqueIds.length) {
      throw new UnknownMinisError();
    }
    const factions = changes.factions && (await this.resolveFactions(ownerId, changes.factions));
    const departure = changes.departure && (await this.checkDeparture(ownerId, uniqueIds, changes.departure));
    const { parts, status, departure: _checked, factions: _resolved, ...rest } = changes;
    const resolved = parts && resolveParts(await this.hoard.findParts(ownerId), parts, randomUUID);
    const changed = minis.map((mini) => {
      let next: Mini = {
        ...mini,
        ...rest,
        ...(factions ? { factionIds: factions.factionIds } : {}),
        ...(resolved ? { parts: resolved.parts } : {}),
      };
      next = status === undefined ? next : withStatus(next, status);
      next = departure === undefined ? next : withDeparture(next, departure ?? undefined);
      return parseMini(next);
    });
    await this.hoard.updateMinis(ownerId, {
      changed,
      newParts: resolved?.newParts ?? [],
      newFactions: factions?.newFactions ?? [],
      droppedPartIds: droppedParts(minis, changed),
      droppedFactionIds: droppedFactions(minis, changed),
    });
    return { minis: changed, ownFactionNames: ownFactionNamesOf(changed, factions?.ownFactions ?? []) };
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
    await this.hoard.deleteMinis(ownerId, [...deleted], {
      changed,
      droppedPartIds: droppedParts(minis, []),
      droppedFactionIds: droppedFactions(minis, []),
    });
    return { emptiedBoxIds: emptiedBoxIds(minis, staying), minis: changed };
  }

  /**
   * A departure by the rules whose recipients are other minis of the owner's hoard.
   *
   * @throws UnknownMinisError when a recipient is not in the owner's hoard or is one of the minis
   */
  private async checkDeparture(ownerId: string, ids: readonly string[], departure: Departure): Promise<Departure> {
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

  /**
   * The factions as ids, with the own factions to add for new names. Factions are catalog factions,
   * whole game systems or the owner's own.
   *
   * @throws UnknownFactionError when an id is neither in the catalog nor one of the owner's own
   */
  private async resolveFactions(
    ownerId: string,
    changes: readonly FactionChange[],
  ): Promise<{ factionIds: string[]; newFactions: OwnFaction[]; ownFactions: OwnFaction[] }> {
    const known = await this.hoard.findOwnFactions(ownerId);
    const { factionIds, newFactions } = resolveFactions(known, changes, randomUUID);
    const ownFactions = [...known, ...newFactions];
    const ownIds = new Set(ownFactions.map((faction) => faction.id));
    const catalogIds = factionIds.filter((id) => !isOwnFaction(id));
    const catalogNames = await this.catalog.findFactionNames(catalogIds);
    if (factionIds.some((id) => (isOwnFaction(id) ? !ownIds.has(id) : !catalogNames.has(id)))) {
      throw new UnknownFactionError();
    }
    return { factionIds, newFactions, ownFactions };
  }
}

/**
 * Runs the change again once when another change added one of its new names meanwhile: the second
 * time, it finds that name among the owner's parts or factions instead of adding it.
 */
async function againIfNameTaken<T>(change: () => Promise<T>): Promise<T> {
  try {
    return await change();
  } catch (error) {
    if (error instanceof NameTakenMeanwhileError) {
      return change();
    }
    throw error;
  }
}
