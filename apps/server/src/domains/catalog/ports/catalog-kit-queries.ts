import type { CatalogKit } from '@greyhoarder/domain/catalog';
import type { VersionedEntry } from '../models/versioned-entry.js';

/** Read-only access to the latest catalog kits, without side effects (CQS); never add a writing method here. */
export abstract class CatalogKitQueries {
  /**
   * The latest version of every kit that is not removed and whose name, the name of any variant,
   * product code or barcode contains the text, ignoring case; at most `limit`, sorted by name.
   */
  abstract searchKits(text: string, limit: number): Promise<VersionedEntry<CatalogKit>[]>;

  /** The latest version of the kits with these ids, removed ones included. */
  abstract findKits(ids: readonly string[]): Promise<VersionedEntry<CatalogKit>[]>;

  /** The names of the latest factions and whole game systems with these ids, by id. */
  abstract findFactionNames(ids: readonly string[]): Promise<ReadonlyMap<string, string>>;

  /** The names of the game systems of the latest factions with these ids, by faction id. */
  abstract findSystemNames(factionIds: readonly string[]): Promise<ReadonlyMap<string, string>>;
}
