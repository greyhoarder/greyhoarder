import type { CatalogFaction, GameSystem } from './catalog-faction.js';
import type { CatalogKit } from './catalog-kit.js';

/** The whole catalog of one release, as read from the catalog repository. */
export interface CatalogSnapshot {
  /** Changes whenever anything in the snapshot changes. */
  readonly hash: string;
  readonly systems: readonly GameSystem[];
  readonly factions: readonly CatalogFaction[];
  readonly kits: readonly CatalogKit[];
  /**
   * Ids whose files or references don't match the format this release knows. They are left out
   * of the snapshot, but keep their last imported version instead of being marked as removed.
   */
  readonly skipped: {
    readonly systemIds: readonly string[];
    readonly factionIds: readonly string[];
    readonly kitIds: readonly string[];
  };
}
