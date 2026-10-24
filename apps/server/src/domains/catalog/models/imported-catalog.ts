import type { CatalogKit } from '@greyhoarder/domain/catalog';
import type { CatalogFaction } from './catalog-faction.js';
import type { GameSystem } from './game-system.js';
import type { VersionedEntry } from './versioned-entry.js';

/** The latest version of every entry imported so far, removed ones included. */
export interface ImportedCatalog {
  readonly systems: readonly VersionedEntry<GameSystem>[];
  readonly factions: readonly VersionedEntry<CatalogFaction>[];
  readonly kits: readonly VersionedEntry<CatalogKit>[];
}
