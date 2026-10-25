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

function fakeQueries(kits: {
  found?: readonly CatalogKit[];
  catalog: readonly CatalogKit[];
  /** Every version of the kits, also older and removed ones. */
  versions?: readonly VersionedEntry<CatalogKit>[];
}): CatalogKitQueries {
  return {
    searchKits: () => Promise.resolve((kits.found ?? []).map(latest)),
    findKits: (ids) => Promise.resolve(kits.catalog.filter((entry) => ids.includes(entry.id)).map(latest)),
    findKitVersion: (id, version) =>
      Promise.resolve(kits.versions?.find((stored) => stored.entry.id === id && stored.version === version)),
    findFactions: () => Promise.resolve([]),
    findKitParts: () => Promise.resolve([]),
    findFactionNames: () => Promise.resolve(new Map()),
    findSystemNames: () => Promise.resolve(new Map()),
  };
}

describe('Kit search', () => {
  it('returns the kits a found bundle contains, also within contained bundles', async () => {
    const service = new KitsService(fakeQueries({ found: [A], catalog: [A, B, C] }));

    const result = await service.search('a');

    expect(result.containedKits.map((contained) => contained.entry.id)).toEqual([B.id, C.id]);
  });
});

describe('Kit of a box', () => {
  it('returns the kit in the version a box records, even when a newer one exists', async () => {
    const renamed = { ...C, name: 'C (renamed)' };
    const service = new KitsService(
      fakeQueries({
        catalog: [renamed],
        versions: [
          { entry: C, version: 1, isRemoved: false },
          { entry: renamed, version: 2, isRemoved: false },
        ],
      }),
    );

    const result = await service.find(C.id, 1);

    expect(result.kits).toEqual([{ entry: C, version: 1, isRemoved: false }]);
  });

  it('returns a kit that was removed from the catalog', async () => {
    const service = new KitsService(
      fakeQueries({ catalog: [], versions: [{ entry: C, version: 1, isRemoved: true }] }),
    );

    const result = await service.find(C.id, 1);

    expect(result.kits.map(({ entry }) => entry.id)).toEqual([C.id]);
  });

  it('returns the kits a bundle contains', async () => {
    const service = new KitsService(
      fakeQueries({ catalog: [A, B, C], versions: [{ entry: A, version: 1, isRemoved: false }] }),
    );

    const result = await service.find(A.id, 1);

    expect(result.containedKits.map(({ entry }) => entry.id)).toEqual([B.id, C.id]);
  });

  it('returns no kit for an unknown kit or version', async () => {
    const service = new KitsService(
      fakeQueries({ catalog: [C], versions: [{ entry: C, version: 1, isRemoved: false }] }),
    );

    const results = [await service.find('games-workshop/orks/unknown', 1), await service.find(C.id, 2)];

    expect(results.map((result) => result.kits)).toEqual([[], []]);
  });
});
