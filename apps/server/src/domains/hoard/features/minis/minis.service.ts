import { Injectable } from '@nestjs/common';
import type { Mini } from '@greyhoarder/domain/hoard';
import { CatalogKitQueries } from '../../../catalog/api/index.js';
import { HoardRepository } from '../../ports/hoard-repository.js';

export interface MiniList {
  readonly minis: readonly Mini[];
  /** The names of the catalog factions the minis refer to, by id. */
  readonly factionNames: ReadonlyMap<string, string>;
  /** The names of the game systems of those factions, by faction id. */
  readonly systemNames: ReadonlyMap<string, string>;
}

/** The minis of the signed-in user's hoard. */
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
}
