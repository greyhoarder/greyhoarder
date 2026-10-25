import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { type HobbyStatus, type Mini, parseMini, withStatus } from '@greyhoarder/domain/hoard';
import { CatalogKitQueries } from '../../../catalog/api/index.js';
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
}

/** The minis of the signed-in user's hoard: listing them and changing several alike at once. */
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
    const { parts, status, ...rest } = changes;
    const resolved = parts && resolveParts(await this.hoard.findParts(ownerId), parts, randomUUID);
    const changed = minis.map((mini) => {
      const next: Mini = { ...mini, ...rest, ...(resolved ? { parts: resolved.parts } : {}) };
      return parseMini(status === undefined ? next : withStatus(next, status));
    });
    await this.hoard.updateMinis(ownerId, changed, resolved?.newParts ?? []);
    return changed;
  }

  /** Factions are references into the catalog: catalog factions or whole game systems. */
  private async checkFactions(factionIds: readonly string[]): Promise<void> {
    const known = await this.catalog.findFactionNames(factionIds);
    if (factionIds.some((id) => !known.has(id))) {
      throw new UnknownFactionError();
    }
  }
}
