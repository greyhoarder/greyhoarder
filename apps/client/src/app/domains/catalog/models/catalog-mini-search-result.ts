import type { CatalogMini } from './catalog-mini';

/** The catalog minis matching a search. */
export interface CatalogMiniSearchResult {
  readonly minis: readonly CatalogMini[];
  /** The names of the minis' factions and game systems, by id. */
  readonly factionNames: ReadonlyMap<string, string>;
  /** The names of the game systems of the minis' factions, by faction id. */
  readonly systemNames: ReadonlyMap<string, string>;
}
