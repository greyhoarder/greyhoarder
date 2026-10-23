import type { CatalogKit } from '@greyhoarder/domain/catalog';

/** The catalog kits matching a search. */
export interface KitSearchResult {
  readonly kits: readonly CatalogKit[];
  /** The names of the factions and whole game systems the kits are listed for, by id. */
  readonly factionNames: ReadonlyMap<string, string>;
}
