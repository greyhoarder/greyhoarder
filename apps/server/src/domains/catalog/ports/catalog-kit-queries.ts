import type { CatalogKit } from '@greyhoarder/domain/catalog';
import type { CatalogFaction } from '../models/catalog-faction.js';
import type { VersionedEntry } from '../models/versioned-entry.js';

/** Read-only access to the latest catalog kits, without side effects (CQS); never add a writing method here. */
export abstract class CatalogKitQueries {
  /**
   * The latest version of every kit that is not removed and whose name, the name of any variant,
   * product code or barcode contains the text, ignoring case; at most `limit`, sorted by name.
   */
  abstract searchKits(text: string, limit: number): Promise<VersionedEntry<CatalogKit>[]>;

  /**
   * The latest version of every kit that is not removed and whose name, or a name its slots can be
   * built as, contains the text, ignoring case; at most `limit`, sorted by name.
   */
  abstract searchKitsByMini(text: string, limit: number): Promise<VersionedEntry<CatalogKit>[]>;

  /** The latest factions that are not removed and whose name contains the text, ignoring case; at most `limit`, sorted by name. */
  abstract searchFactions(text: string, limit: number): Promise<CatalogFaction[]>;

  /** The latest version of the kits with these ids, removed ones included. */
  abstract findKits(ids: readonly string[]): Promise<VersionedEntry<CatalogKit>[]>;

  /** This version of the kit, also when the kit was removed later; undefined if there is none. */
  abstract findKitVersion(id: string, version: number): Promise<VersionedEntry<CatalogKit> | undefined>;

  /** The names of the latest factions and whole game systems with these ids, by id. */
  abstract findFactionNames(ids: readonly string[]): Promise<ReadonlyMap<string, string>>;

  /** The latest versions of the factions with these ids that are not removed. */
  abstract findFactions(ids: readonly string[]): Promise<CatalogFaction[]>;

  /**
   * Every part the slots of the latest kits that are not removed offer, each once, of the kits
   * listed for one of the factions, or with a slot listed for one.
   */
  abstract findKitParts(factionIds: readonly string[]): Promise<string[]>;

  /** The names of the game systems of the latest factions with these ids, by faction id. */
  abstract findSystemNames(factionIds: readonly string[]): Promise<ReadonlyMap<string, string>>;
}
