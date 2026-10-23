import type { CatalogFaction, GameSystem } from './catalog-faction.js';
import type { CatalogKit } from './catalog-kit.js';

/** The whole catalog of one release, as read from the catalog repository. */
export interface CatalogSnapshot {
  /** Changes whenever anything in the snapshot changes. */
  readonly hash: string;
  readonly systems: readonly GameSystem[];
  readonly factions: readonly CatalogFaction[];
  readonly kits: readonly CatalogKit[];
}
