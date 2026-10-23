import { Injectable } from '@nestjs/common';
import type { CatalogKit } from '@greyhoarder/domain/catalog';
import { CatalogRepository } from '../../ports/catalog-repository.js';

/** Enough to choose a kit; a narrower search finds the rest. */
const SEARCH_LIMIT = 50;

export interface KitSearchResult {
  readonly kits: readonly CatalogKit[];
  /** The names of the factions and whole game systems the kits are listed for, by id. */
  readonly factionNames: ReadonlyMap<string, string>;
}

/** Finding catalog kits to add a box from; removed kits are no longer offered (ADR-0020). */
@Injectable()
export class KitsService {
  constructor(private readonly catalog: CatalogRepository) {}

  async search(text: string): Promise<KitSearchResult> {
    const kits = await this.catalog.searchKits(text, SEARCH_LIMIT);
    const factionIds = [...new Set(kits.flatMap((kit) => kit.factionIds))];
    const factionNames = await this.catalog.findFactionNames(factionIds);
    return { kits, factionNames };
  }
}
