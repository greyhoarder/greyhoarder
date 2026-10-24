import type { CatalogKit } from '@greyhoarder/domain/catalog';
import type { VersionedEntry } from '../../models/versioned-entry.js';
import type { CatalogKitQueries } from '../../ports/catalog-kit-queries.js';
import { KitsService } from './kits.service.js';

function kit(id: string, containedIds: readonly string[] = []): CatalogKit {
  return {
    id,
    manufacturer: 'games-workshop',
    name: id,
    factionIds: ['warhammer-40000/orks'],
    releases: [],
    minis: 10,
    isDraft: false,
    contains: containedIds.map((kitId) => ({ kitId, count: 1 })),
    variants: [],
  };
}

const C = kit('games-workshop/orks/c');
const B = kit('games-workshop/orks/b', [C.id]);
const A = kit('games-workshop/orks/a', [B.id]);

function latest(entry: CatalogKit): VersionedEntry<CatalogKit> {
  return { entry, version: 1, isRemoved: false };
}

function fakeQueries(kits: { found: readonly CatalogKit[]; catalog: readonly CatalogKit[] }): CatalogKitQueries {
  return {
    searchKits: () => Promise.resolve(kits.found.map(latest)),
    findKits: (ids) => Promise.resolve(kits.catalog.filter((entry) => ids.includes(entry.id)).map(latest)),
    findFactionNames: () => Promise.resolve(new Map()),
  };
}

describe('Kit search', () => {
  it('returns the kits a found bundle contains, also within contained bundles', async () => {
    const service = new KitsService(fakeQueries({ found: [A], catalog: [A, B, C] }));

    const result = await service.search('a');

    expect(result.containedKits.map((contained) => contained.entry.id)).toEqual([B.id, C.id]);
  });
});
