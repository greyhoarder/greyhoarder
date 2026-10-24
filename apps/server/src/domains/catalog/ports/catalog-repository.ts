import type { CatalogImport } from '../models/catalog-import.js';
import type { ImportedCatalog } from '../models/imported-catalog.js';

/** Storage of the imported catalog for its import; never published through `catalog/api`. */
export abstract class CatalogRepository {
  /** `undefined` before the first import. */
  abstract findLastSnapshotHash(): Promise<string | undefined>;

  abstract findImported(): Promise<ImportedCatalog>;

  /** Applies the whole import or nothing of it, and records its snapshot as the last one. */
  abstract applyImport(catalogImport: CatalogImport): Promise<void>;
}
