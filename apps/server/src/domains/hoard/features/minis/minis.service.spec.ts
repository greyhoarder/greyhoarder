import type { Mini, Part } from '@greyhoarder/domain/hoard';
import type { CatalogKitQueries } from '../../../catalog/api/index.js';
import type { HoardRepository } from '../../ports/hoard-repository.js';
import { UnknownFactionError } from './errors/unknown-faction.error.js';
import { UnknownMinisError } from './errors/unknown-minis.error.js';
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

/** A hoard with these minis and this vocabulary, which records what is stored. */
function fakeHoard(minis: readonly Mini[], parts: readonly Part[] = [POWER_KLAW]) {
  const updateMinis = vi.fn<HoardRepository['updateMinis']>(() => Promise.resolve());
  const hoard: HoardRepository = {
    findBoxes: vi.fn(),
    findMinis: vi.fn(() => Promise.resolve([...minis])),
    findMinisByIds: vi.fn((_owner, ids) => Promise.resolve(minis.filter((mini) => ids.includes(mini.id)))),
    findParts: vi.fn(() => Promise.resolve([...parts])),
    addBoxes: vi.fn(),
    updateMinis,
  };
  return { hoard, updateMinis };
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
      addBoxes: vi.fn(),
      updateMinis: vi.fn(),
    };
    const service = new MinisService(hoard, CATALOG);

    const { systemNames } = await service.list('owner');

    expect(systemNames).toEqual(new Map([['warhammer-40000/orks', 'Warhammer 40,000']]));
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
    expect(stored?.map(({ id, name, status, parts }) => ({ id, name, status, parts }))).toEqual(
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

    const [mini] = await service.update('owner', ['boy'], { parts: [{ name: 'power claw', isSwappable: false }] });

    expect(mini?.parts).toEqual([{ partId: 'power-klaw', isSwappable: false }]);
    expect(updateMinis).toHaveBeenCalledWith('owner', expect.anything(), []);
  });

  it('adds a name the vocabulary does not know to it, once', async () => {
    const { hoard, updateMinis } = fakeHoard([BOY, { ...BOY, id: 'boy-2' }]);
    const service = new MinisService(hoard, CATALOG);

    const minis = await service.update('owner', ['boy', 'boy-2'], {
      parts: [{ name: 'Grot Banner', isSwappable: false }],
    });

    const [, , newParts] = updateMinis.mock.calls[0] ?? [];
    expect(newParts?.map((part) => part.name)).toEqual(['Grot Banner']);
    expect(minis.map((mini) => mini.parts[0]?.partId)).toEqual([newParts?.[0]?.id, newParts?.[0]?.id]);
  });

  it('takes the minis off the workbench when they are set to done', async () => {
    const { hoard } = fakeHoard([{ ...BOY, status: 'painted', isOnWorkbench: true }]);
    const service = new MinisService(hoard, CATALOG);

    const [mini] = await service.update('owner', ['boy'], { status: 'done' });

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

    const update = service.update('owner', ['boy'], { factionIds: ['warhammer-40000/grots'] });

    await expect(update).rejects.toThrow(UnknownFactionError);
    expect(updateMinis).not.toHaveBeenCalled();
  });
});
