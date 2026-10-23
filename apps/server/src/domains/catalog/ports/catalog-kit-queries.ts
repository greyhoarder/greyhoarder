import type { CatalogKit } from '@greyhoarder/domain/catalog';

/** Read-only access to the latest catalog kits, without side effects (CQS); never add a writing method here. */
export abstract class CatalogKitQueries {
  /**
   * The latest version of every kit that is not removed and whose name, the name of any variant,
   * product code or barcode contains the text, ignoring case; at most `limit`, sorted by name.
   */
  abstract searchKits(text: string, limit: number): Promise<CatalogKit[]>;

  /** The names of the latest factions and whole game systems with these ids, by id. */
  abstract findFactionNames(ids: readonly string[]): Promise<ReadonlyMap<string, string>>;
}
