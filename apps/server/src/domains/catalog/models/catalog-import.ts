import type { CatalogKit } from '@greyhoarder/domain/catalog';
import type { CatalogFaction } from './catalog-faction.js';
import type { CatalogUpdate } from './catalog-update.js';
import type { GameSystem } from './game-system.js';

export interface CatalogImport {
  readonly snapshotHash: string;
  readonly systems: CatalogUpdate<GameSystem>;
  readonly factions: CatalogUpdate<CatalogFaction>;
  readonly kits: CatalogUpdate<CatalogKit>;
}
