import { Injectable } from '@nestjs/common';
import type { Mini } from '@greyhoarder/domain/hoard';
import { CatalogKitQueries } from '../../../catalog/api/index.js';
import { HoardRepository } from '../../ports/hoard-repository.js';

export interface MiniList {
  readonly minis: readonly Mini[];
  /** The names of the catalog factions the minis refer to, by id. */
  readonly factionNames: ReadonlyMap<string, string>;
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
    const factionNames = await this.catalog.findFactionNames([...new Set(minis.flatMap((mini) => mini.factionIds))]);
    return { minis, factionNames };
  }
}
