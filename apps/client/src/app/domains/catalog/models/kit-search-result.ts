import type { VersionedCatalogKit } from './versioned-catalog-kit';

/** The catalog kits matching a search. */
export interface KitSearchResult {
  readonly kits: readonly VersionedCatalogKit[];
  /** Every kit the found kits contain, also within contained bundles, by id. */
  readonly containedKits: ReadonlyMap<string, VersionedCatalogKit>;
  /** The names of the factions and whole game systems the kits and their slots are listed for, by id. */
  readonly factionNames: ReadonlyMap<string, string>;
}
