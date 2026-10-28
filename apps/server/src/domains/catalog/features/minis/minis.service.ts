import { Injectable } from '@nestjs/common';
import { type CatalogMini, catalogMinisOf } from '../../models/catalog-mini.js';
import { CatalogKitQueries } from '../../ports/catalog-kit-queries.js';

/** Enough to choose a mini; a narrower search finds the rest. */
const SEARCH_LIMIT = 50;
/** The kits the minis are taken from; far more than the minis of a search need. */
const KIT_LIMIT = 500;

/** Catalog minis found by a search, with the names it takes to show them. */
export interface CatalogMiniSearchResult {
  readonly minis: readonly CatalogMini[];
  /** The names of the minis' factions and game systems, by id. */
  readonly factionNames: ReadonlyMap<string, string>;
  /** The names of the game systems of the minis' factions, by faction id. */
  readonly systemNames: ReadonlyMap<string, string>;
}

/** Finding the minis of the catalog, e.g. to add minis without their box; removed kits are not offered. */
@Injectable()
export class MinisService {
  constructor(private readonly catalog: CatalogKitQueries) {}

  /** The minis whose name, or the name of a kit they come from, contains the text; sorted by name, then faction. */
  async search(text: string): Promise<CatalogMiniSearchResult> {
    const kits = await this.catalog.searchKitsByMini(text, KIT_LIMIT);
    const minis = catalogMinisOf(
      kits.map(({ entry }) => entry),
      text,
    );
    const factionIds = [...new Set(minis.flatMap((mini) => (mini.factionId === undefined ? [] : [mini.factionId])))];
    const [factionNames, systemNames] = await Promise.all([
      this.catalog.findFactionNames(factionIds),
      this.catalog.findSystemNames(factionIds),
    ]);
    const factionOf = (mini: CatalogMini) =>
      mini.factionId === undefined ? '' : (factionNames.get(mini.factionId) ?? mini.factionId);
    const sorted = [...minis]
      .sort((a, b) => a.name.localeCompare(b.name) || factionOf(a).localeCompare(factionOf(b)))
      .slice(0, SEARCH_LIMIT);
    return { minis: sorted, factionNames, systemNames };
  }
}
