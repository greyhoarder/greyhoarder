import type { CatalogSnapshot } from '../models/catalog-snapshot.js';

/** The catalog that ships with this release. */
export abstract class CatalogSnapshotSource {
  /** Files and references that don't match the format this release knows are left out with a warning. */
  abstract load(): Promise<CatalogSnapshot>;
}
