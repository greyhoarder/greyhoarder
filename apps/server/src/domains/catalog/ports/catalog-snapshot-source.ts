import type { CatalogSnapshot } from '@greyhoarder/domain/catalog';

/** The catalog that ships with this release. */
export abstract class CatalogSnapshotSource {
  /** @throws CatalogFormatError when a file or reference does not match the format this release knows */
  abstract load(): Promise<CatalogSnapshot>;
}
