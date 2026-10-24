import type { CatalogKit } from '@greyhoarder/domain/catalog';

/** The catalog kits matching a search. */
export interface KitSearchResult {
  readonly kits: readonly CatalogKit[];
  /** Every kit the found kits contain, also within contained bundles, by id. */
  readonly containedKits: ReadonlyMap<string, CatalogKit>;
  /** The names of the factions and whole game systems the kits are listed for, by id. */
  readonly factionNames: ReadonlyMap<string, string>;
}
