import type { Mini, OwnFaction, Part } from '@greyhoarder/domain/hoard';
import type { CatalogKitQueries } from '../../../catalog/api/index.js';
import type { HoardRepository } from '../../ports/hoard-repository.js';
import { UnknownFactionError } from './errors/unknown-faction.error.js';
import { UnknownMinisError } from './errors/unknown-minis.error.js';
import { NameTakenMeanwhileError } from '../../models/errors/name-taken-meanwhile.error.js';
import { UnknownPartError } from '../../models/errors/unknown-part.error.js';
import { MinisService } from './minis.service.js';

const BOY: Mini = {
  id: 'boy',
  name: 'Boy',
  factionIds: ['warhammer-40000/orks'],
  status: 'sprue',
  parts: [],
  isOnWorkbench: false,
};

const POWER_KLAW: Part = { id: 'power-klaw', name: 'Power Klaw', aliases: ['Power Claw'] };

const CRIMSON_WOLVES: OwnFaction = { id: 'own/crimson-wolves', name: 'Crimson Wolves' };

/** A hoard with these minis, this vocabulary and these own factions, which records what is stored. */
function fakeHoard(
  minis: readonly Mini[],
  parts: readonly Part[] = [POWER_KLAW],
  ownFactions: readonly OwnFaction[] = [],
) {
  const updateMinis = vi.fn<HoardRepository['updateMinis']>(() => Promise.resolve());
  const deleteMinis = vi.fn<HoardRepository['deleteMinis']>(() => Promise.resolve());
  const hoard: HoardRepository = {
    findBoxes: vi.fn(),
    findMinis: vi.fn(() => Promise.resolve([...minis])),
    findMinisByIds: vi.fn((_owner, ids) => Promise.resolve(minis.filter((mini) => ids.includes(mini.id)))),
    findParts: vi.fn(() => Promise.resolve([...parts])),
    findOwnFactions: vi.fn(() => Promise.resolve([...ownFactions])),
    addBoxes: vi.fn(),
    updateMinis,
    deleteMinis,
    deleteBox: vi.fn(),
  };
  return { hoard, updateMinis, deleteMinis };
}

const CATALOG: CatalogKitQueries = {
  searchKits: () => Promise.resolve([]),
  findKits: () => Promise.resolve([]),
  findKitVersion: () => Promise.resolve(undefined),
  findFactions: () => Promise.resolve([]),
  findKitParts: () => Promise.resolve([]),
  findFactionNames: () => Promise.resolve(new Map([['warhammer-40000/orks', 'Orks']])),
  findSystemNames: (factionIds) =>
    Promise.resolve(
      new Map(factionIds.includes('warhammer-40000/orks') ? [['warhammer-40000/orks', 'Warhammer 40,000']] : []),
    ),
};

describe('Minis service', () => {
  it('lists the game system names of the factions its minis refer to', async () => {
    const hoard = {
      findBoxes: vi.fn(),
      findMinis: vi.fn(() => Promise.resolve([BOY])),
      findMinisByIds: vi.fn(),
      findParts: vi.fn(),
      findOwnFactions: vi.fn(() => Promise.resolve([])),
      addBoxes: vi.fn(),
      updateMinis: vi.fn(),
    };
    const service = new MinisService(hoard, CATALOG);

    const { systemNames } = await service.list('owner');

    expect(systemNames).toEqual(new Map([['warhammer-40000/orks', 'Warhammer 40,000']]));
  });

  it("lists the names of the user's own factions its minis carry", async () => {
    const wolf = { ...BOY, factionIds: ['warhammer-40000/orks', 'own/crimson-wolves'] };
    const { hoard } = fakeHoard([wolf], [POWER_KLAW], [CRIMSON_WOLVES]);
    const service = new MinisService(hoard, CATALOG);

    const { factionNames } = await service.list('owner');

    expect(factionNames.get('own/crimson-wolves')).toBe('Crimson Wolves');
  });

  it("lists the factions the minis' factions are part of, up the whole chain, with their names", async () => {
    const wolf = { ...BOY, factionIds: ['warhammer-40000/crimson-wolves'] };
    const { hoard } = fakeHoard([wolf]);
    const factions = [
      { id: 'warhammer-40000/crimson-wolves', partOfId: 'warhammer-40000/dark-angels', name: 'Crimson Wolves' },
      { id: 'warhammer-40000/dark-angels', partOfId: 'warhammer-40000/space-marines', name: 'Dark Angels' },
      { id: 'warhammer-40000/space-marines', name: 'Space Marines' },
    ];
    const catalog: CatalogKitQueries = {
      searchKits: () => Promise.resolve([]),
      findKits: () => Promise.resolve([]),
      findKitVersion: () => Promise.resolve(undefined),
      findKitParts: () => Promise.resolve([]),
      findSystemNames: () => Promise.resolve(new Map()),
      findFactions: (ids) =>
        Promise.resolve(
          factions
            .filter((faction) => ids.includes(faction.id))
            .map(({ name: _name, ...faction }) => ({ ...faction, systemId: 'warhammer-40000' })),
        ),
      findFactionNames: (ids) =>
        Promise.resolve(
          new Map(factions.filter((faction) => ids.includes(faction.id)).map((faction) => [faction.id, faction.name])),
        ),
    };
    const service = new MinisService(hoard, catalog);

    const { partOf, factionNames } = await service.list('owner');

    expect(partOf).toEqual(
      new Map([
        ['warhammer-40000/crimson-wolves', 'warhammer-40000/dark-angels'],
        ['warhammer-40000/dark-angels', 'warhammer-40000/space-marines'],
      ]),
    );
    expect([...factionNames.values()]).toEqual(['Crimson Wolves', 'Dark Angels', 'Space Marines']);
  });

  it('applies the changes to every given mini', async () => {
    const { hoard, updateMinis } = fakeHoard([BOY, { ...BOY, id: 'boy-2' }]);
    const service = new MinisService(hoard, CATALOG);

    await service.update('owner', ['boy', 'boy-2'], {
      name: 'Boss Nob',
      status: 'built',
      parts: [{ partId: 'power-klaw', isSwappable: true }],
    });

    expect(updateMinis).toHaveBeenCalledOnce();
    const [, stored] = updateMinis.mock.calls[0] ?? [];
    expect(stored?.changed.map(({ id, name, status, parts }) => ({ id, name, status, parts }))).toEqual(
      ['boy', 'boy-2'].map((id) => ({
        id,
        name: 'Boss Nob',
        status: 'built',
        parts: [{ partId: 'power-klaw', isSwappable: true }],
      })),
    );
  });

  it('refers to the part of the vocabulary that a given name or alias means', async () => {
    const { hoard, updateMinis } = fakeHoard([BOY]);
    const service = new MinisService(hoard, CATALOG);

    const {
      minis: [mini],
    } = await service.update('owner', ['boy'], {
      parts: [{ name: 'power claw', isSwappable: false }],
    });

    expect(mini?.parts).toEqual([{ partId: 'power-klaw', isSwappable: false }]);
    expect(updateMinis).toHaveBeenCalledWith('owner', expect.objectContaining({ newParts: [] }));
  });

  it('adds a name the vocabulary does not know to it, once', async () => {
    const { hoard, updateMinis } = fakeHoard([BOY, { ...BOY, id: 'boy-2' }]);
    const service = new MinisService(hoard, CATALOG);

    const { minis } = await service.update('owner', ['boy', 'boy-2'], {
      parts: [{ name: 'Grot Banner', isSwappable: false }],
    });

    const [, change] = updateMinis.mock.calls[0] ?? [];
    const newParts = change?.newParts;
    expect(newParts?.map((part) => part.name)).toEqual(['Grot Banner']);
    expect(minis.map((mini) => mini.parts[0]?.partId)).toEqual([newParts?.[0]?.id, newParts?.[0]?.id]);
  });

  it('takes the minis off the workbench when they are set to done', async () => {
    const { hoard } = fakeHoard([{ ...BOY, status: 'painted', isOnWorkbench: true }]);
    const service = new MinisService(hoard, CATALOG);

    const {
      minis: [mini],
    } = await service.update('owner', ['boy'], { status: 'done' });

    expect(mini?.isOnWorkbench).toBe(false);
  });

  it("changes nothing when one of the minis is not in the user's hoard", async () => {
    const { hoard, updateMinis } = fakeHoard([BOY]);
    const service = new MinisService(hoard, CATALOG);

    const update = service.update('owner', ['boy', 'someone-elses'], { name: 'Boss Nob' });

    await expect(update).rejects.toThrow(UnknownMinisError);
    expect(updateMinis).not.toHaveBeenCalled();
  });

  it("changes nothing when a part refers to an id that is not in the user's vocabulary", async () => {
    const { hoard, updateMinis } = fakeHoard([BOY]);
    const service = new MinisService(hoard, CATALOG);

    const update = service.update('owner', ['boy'], { parts: [{ partId: 'unknown', isSwappable: false }] });

    await expect(update).rejects.toThrow(UnknownPartError);
    expect(updateMinis).not.toHaveBeenCalled();
  });

  it('changes nothing when a faction is in neither the catalog nor its game systems', async () => {
    const { hoard, updateMinis } = fakeHoard([BOY]);
    const service = new MinisService(hoard, CATALOG);

    const update = service.update('owner', ['boy'], { factions: [{ id: 'warhammer-40000/grots' }] });

    await expect(update).rejects.toThrow(UnknownFactionError);
    expect(updateMinis).not.toHaveBeenCalled();
  });

  it('adds a faction name the user has no own faction of to their own factions, once', async () => {
    const { hoard, updateMinis } = fakeHoard([BOY]);
    const service = new MinisService(hoard, CATALOG);

    const { minis } = await service.update('owner', ['boy'], {
      factions: [{ name: 'Crimson Wolves' }, { name: 'crimson wolves' }],
    });

    const [, change] = updateMinis.mock.calls[0] ?? [];
    const newFactions = change?.newFactions;
    expect(newFactions?.map((faction) => faction.name)).toEqual(['Crimson Wolves']);
    expect(minis[0]?.factionIds).toEqual([newFactions?.[0]?.id]);
  });

  it('stores the change again with the own faction another change added meanwhile under its name', async () => {
    const { hoard, updateMinis } = fakeHoard([BOY]);
    hoard.findOwnFactions = vi
      .fn<HoardRepository['findOwnFactions']>()
      .mockResolvedValueOnce([])
      .mockResolvedValue([CRIMSON_WOLVES]);
    updateMinis.mockRejectedValueOnce(new NameTakenMeanwhileError());
    const service = new MinisService(hoard, CATALOG);

    const { minis } = await service.update('owner', ['boy'], { factions: [{ name: 'Crimson Wolves' }] });

    expect(updateMinis).toHaveBeenCalledTimes(2);
    expect(updateMinis).toHaveBeenLastCalledWith('owner', expect.objectContaining({ newFactions: [] }));
    expect(minis[0]?.factionIds).toEqual(['own/crimson-wolves']);
  });

  it("changes nothing when an own faction is not one of the user's", async () => {
    const { hoard, updateMinis } = fakeHoard([BOY]);
    const service = new MinisService(hoard, CATALOG);

    const update = service.update('owner', ['boy'], { factions: [{ id: 'own/someone-elses' }] });

    await expect(update).rejects.toThrow(UnknownFactionError);
    expect(updateMinis).not.toHaveBeenCalled();
  });

  it('keeps the boxes of deleted minis', async () => {
    const { hoard, deleteMinis } = fakeHoard([{ ...BOY, boxId: 'boyz' }]);
    const service = new MinisService(hoard, CATALOG);

    const { emptiedBoxIds } = await service.delete('owner', ['boy']);

    expect(deleteMinis).toHaveBeenCalledWith('owner', ['boy'], expect.objectContaining({ changed: [] }));
    expect(emptiedBoxIds).toEqual(['boyz']);
  });

  it('records the catalog kit the minis are added from', async () => {
    const addMinis = vi.fn<HoardRepository['addMinis']>(() => Promise.resolve());
    const { hoard } = fakeHoard([]);
    hoard.addMinis = addMinis;
    const catalog = {
      findFactionNames: () => Promise.resolve(new Map([['warhammer-40000/orks', 'Orks']])),
      findKitVersion: () =>
        Promise.resolve({
          entry: {
            id: 'games-workshop/orks/boyz-2026',
            manufacturer: 'games-workshop',
            name: 'Boyz',
            factionIds: ['warhammer-40000/orks'],
            releases: [{ year: 2026, sku: '50-80' }],
            minis: 10,
            isDraft: false,
            contains: [],
            variants: [],
          },
          version: 1,
          isRemoved: false,
        }),
    } as unknown as CatalogKitQueries;
    const service = new MinisService(hoard, catalog);

    const [added] = await service.add('owner', {
      name: 'Boy',
      factions: [{ id: 'warhammer-40000/orks' }],
      status: 'sprue',
      parts: [],
      kit: { id: 'games-workshop/orks/boyz-2026', version: 1 },
      count: 1,
    });

    expect(added?.kit).toEqual({
      id: 'games-workshop/orks/boyz-2026',
      version: 1,
      name: 'Boyz (2026)',
      sku: '50-80',
    });
  });
});
