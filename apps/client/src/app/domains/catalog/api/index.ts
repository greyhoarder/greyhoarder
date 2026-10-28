/** Searching the catalog kits, and finding the version of one a box was added from. */
export { HttpKitsAdapter } from '../infrastructure/http-kits-adapter';
/** The parts the catalog kits of a range offer. */
export { HttpCatalogPartsAdapter } from '../infrastructure/http-catalog-parts-adapter';
/** Searching the minis the catalog kits can be built as. */
export { HttpCatalogMinisAdapter } from '../infrastructure/http-catalog-minis-adapter';
/** Searching the catalog factions. */
export { HttpCatalogFactionsAdapter } from '../infrastructure/http-catalog-factions-adapter';
export type { CatalogMini } from '../models/catalog-mini';
export type { CatalogMiniSearchResult } from '../models/catalog-mini-search-result';
export type { FoundFaction } from '../models/found-faction';
export type { KitSearchResult } from '../models/kit-search-result';
export type { VersionedCatalogKit } from '../models/versioned-catalog-kit';
