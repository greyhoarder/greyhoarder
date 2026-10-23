import type { CatalogKit, CatalogSnapshot } from '@greyhoarder/domain/catalog';
import type { CatalogImport, ImportedCatalog } from '../../ports/catalog-repository.js';
import { ImportService } from './import.service.js';

function kit(id: string, minis = 10): CatalogKit {
  return {
    id,
    manufacturer: 'games-workshop',
    name: id,
    factionIds: ['warhammer-40000/orks'],
    releases: [],
    minis,
    isDraft: false,
    contains: [],
    variants: [{ name: id, slots: [{ count: minis, buildsAs: ['Boy'], parts: [], factionIds: [] }] }],
  };
}

const NOTHING_IMPORTED: ImportedCatalog = { systems: [], factions: [], kits: [] };
const NOTHING_SKIPPED: CatalogSnapshot['skipped'] = { systemIds: [], factionIds: [], kitIds: [] };

describe('Catalog import', () => {
  function importWhere(snapshot: CatalogSnapshot, imported: ImportedCatalog, lastHash?: string) {
    const applyImport = vi.fn((_catalogImport: CatalogImport) => Promise.resolve());
    const service = new ImportService(
      { load: () => Promise.resolve(snapshot) },
      {
        findLastSnapshotHash: () => Promise.resolve(lastHash),
        findImported: () => Promise.resolve(imported),
        searchKits: () => Promise.resolve([]),
        findFactionNames: () => Promise.resolve(new Map()),
        applyImport,
      },
    );
    return { service, applyImport };
  }

  it('imports every system, faction and kit as version 1 on the first start', async () => {
    const system = { id: 'warhammer-40000', name: 'Warhammer 40,000', groups: [] };
    const faction = { id: 'warhammer-40000/orks', systemId: 'warhammer-40000', name: 'Orks' };
    const boyz = kit('games-workshop/orks/boyz');
    const { service, applyImport } = importWhere(
      { hash: 'first', systems: [system], factions: [faction], kits: [boyz], skipped: NOTHING_SKIPPED },
      NOTHING_IMPORTED,
    );

    await service.importSnapshot();

    expect(applyImport).toHaveBeenCalledWith({
      snapshotHash: 'first',
      systems: { versions: [{ entry: system, version: 1 }], removedIds: [], restoredIds: [] },
      factions: { versions: [{ entry: faction, version: 1 }], removedIds: [], restoredIds: [] },
      kits: { versions: [{ entry: boyz, version: 1 }], removedIds: [], restoredIds: [] },
    });
  });

  it('imports nothing when the catalog has not changed since the last import', async () => {
    const boyz = kit('games-workshop/orks/boyz');
    const { service, applyImport } = importWhere(
      { hash: 'same', systems: [], factions: [], kits: [boyz], skipped: NOTHING_SKIPPED },
      { ...NOTHING_IMPORTED, kits: [{ entry: boyz, version: 1, isRemoved: false }] },
      'same',
    );

    await service.importSnapshot();

    expect(applyImport).not.toHaveBeenCalled();
  });

  it('gives a changed kit the next version and leaves unchanged kits as they are', async () => {
    const intercessors = kit('games-workshop/space-marines/intercessors');
    const changedBoyz = kit('games-workshop/orks/boyz', 11);
    const { service, applyImport } = importWhere(
      { hash: 'second', systems: [], factions: [], kits: [changedBoyz, intercessors], skipped: NOTHING_SKIPPED },
      {
        ...NOTHING_IMPORTED,
        kits: [
          { entry: kit('games-workshop/orks/boyz', 10), version: 1, isRemoved: false },
          { entry: intercessors, version: 1, isRemoved: false },
        ],
      },
      'first',
    );

    await service.importSnapshot();

    expect(applyImport.mock.calls[0]?.[0].kits).toEqual({
      versions: [{ entry: changedBoyz, version: 2 }],
      removedIds: [],
      restoredIds: [],
    });
  });

  it('does not mark a kit as removed while its file is broken', async () => {
    const boyz = kit('games-workshop/orks/boyz');
    const { service, applyImport } = importWhere(
      {
        hash: 'broken',
        systems: [],
        factions: [],
        kits: [],
        skipped: { ...NOTHING_SKIPPED, kitIds: [boyz.id] },
      },
      { ...NOTHING_IMPORTED, kits: [{ entry: boyz, version: 1, isRemoved: false }] },
      'first',
    );

    await service.importSnapshot();

    expect(applyImport.mock.calls[0]?.[0].kits.removedIds).toEqual([]);
  });

  it('does not mark the factions of a system as removed while its file is broken', async () => {
    const system = { id: 'warhammer-40000', name: 'Warhammer 40,000', groups: [] };
    const orks = { id: 'warhammer-40000/orks', systemId: 'warhammer-40000', name: 'Orks' };
    const { service, applyImport } = importWhere(
      {
        hash: 'broken',
        systems: [],
        factions: [],
        kits: [],
        skipped: { ...NOTHING_SKIPPED, systemIds: [system.id] },
      },
      {
        ...NOTHING_IMPORTED,
        systems: [{ entry: system, version: 1, isRemoved: false }],
        factions: [{ entry: orks, version: 1, isRemoved: false }],
      },
      'first',
    );

    await service.importSnapshot();

    const { systems, factions } = applyImport.mock.calls[0]?.[0] ?? {};
    expect(systems?.removedIds).toEqual([]);
    expect(factions?.removedIds).toEqual([]);
  });
});
