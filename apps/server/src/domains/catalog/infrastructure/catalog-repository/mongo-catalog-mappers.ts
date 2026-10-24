import type { CatalogKit } from '@greyhoarder/domain/catalog';
import type { CatalogFaction } from '../../models/catalog-faction.js';
import type { GameSystem } from '../../models/game-system.js';
import type { VersionedEntry } from '../../models/versioned-entry.js';
import type { CatalogFactionDbo } from './schemas/mongo-catalog-faction-schema.js';
import type { CatalogKitDbo } from './schemas/mongo-catalog-kit-schema.js';
import type { GameSystemDbo } from './schemas/mongo-game-system-schema.js';

// The mappers copy only the fields of the domain models, so `_id`, flags and timestamps stay in the adapter.

export function toGameSystem(stored: GameSystemDbo): GameSystem {
  return {
    id: stored.systemId,
    name: stored.name,
    groups: stored.groups.map((group) => ({ id: group.id, name: group.name })),
  };
}

export function toCatalogFaction(stored: CatalogFactionDbo): CatalogFaction {
  return {
    id: stored.factionId,
    systemId: stored.systemId,
    name: stored.name,
    groupId: stored.groupId,
    partOfId: stored.partOfId,
  };
}

export function toCatalogKit(stored: CatalogKitDbo): CatalogKit {
  return {
    id: stored.kitId,
    manufacturer: stored.manufacturer,
    name: stored.name,
    factionIds: stored.factionIds,
    releases: stored.releases.map((release) => ({ year: release.year, sku: release.sku, barcode: release.barcode })),
    minis: stored.minis,
    isDraft: stored.isDraft,
    supersedesId: stored.supersedesId,
    contains: stored.contains.map((contained) => ({ kitId: contained.kitId, count: contained.count })),
    variants: stored.variants.map((variant) => ({
      name: variant.name,
      slots: variant.slots.map((slot) => ({
        count: slot.count,
        buildsAs: slot.buildsAs,
        parts: slot.parts,
        factionIds: slot.factionIds,
      })),
    })),
  };
}

export function toVersionedEntry<S extends { version: number; isRemoved: boolean }, T extends { readonly id: string }>(
  stored: S,
  toEntry: (stored: S) => T,
): VersionedEntry<T> {
  return { entry: toEntry(stored), version: stored.version, isRemoved: stored.isRemoved };
}
