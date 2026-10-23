import type {
  CatalogFaction,
  CatalogKit,
  CatalogUpdate,
  GameSystem,
  VersionedEntry,
} from '@greyhoarder/domain/catalog';

/** The latest version of every entry imported so far, removed ones included. */
export interface ImportedCatalog {
  readonly systems: readonly VersionedEntry<GameSystem>[];
  readonly factions: readonly VersionedEntry<CatalogFaction>[];
  readonly kits: readonly VersionedEntry<CatalogKit>[];
}

export interface CatalogImport {
  readonly snapshotHash: string;
  readonly systems: CatalogUpdate<GameSystem>;
  readonly factions: CatalogUpdate<CatalogFaction>;
  readonly kits: CatalogUpdate<CatalogKit>;
}

/** Storage of the imported catalog for the features of this domain. */
export abstract class CatalogRepository {
  /** `undefined` before the first import. */
  abstract findLastSnapshotHash(): Promise<string | undefined>;

  abstract findImported(): Promise<ImportedCatalog>;

  /**
   * The latest version of every kit that is not removed and whose name, product code or barcode
   * contains the text, ignoring case; at most `limit`, sorted by name.
   */
  abstract searchKits(text: string, limit: number): Promise<CatalogKit[]>;

  /** The names of the latest factions and whole game systems with these ids, by id. */
  abstract findFactionNames(ids: readonly string[]): Promise<ReadonlyMap<string, string>>;

  /** Applies the whole import or nothing of it, and records its snapshot as the last one. */
  abstract applyImport(catalogImport: CatalogImport): Promise<void>;
}
