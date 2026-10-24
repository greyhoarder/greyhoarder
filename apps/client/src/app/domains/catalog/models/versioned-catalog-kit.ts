import type { CatalogKit } from '@greyhoarder/domain/catalog';

/** A catalog kit with the version that a box added from it records. */
export type VersionedCatalogKit = CatalogKit & { readonly version: number };
