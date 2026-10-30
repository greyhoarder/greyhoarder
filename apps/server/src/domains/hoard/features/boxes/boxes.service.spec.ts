import type { CatalogKit } from '@greyhoarder/domain/catalog';
import type { Box, Mini } from '@greyhoarder/domain/hoard';
import type { CatalogKitQueries } from '../../../catalog/api/index.js';
import type { HoardRepository } from '../../ports/hoard-repository.js';
import { BoxesService } from './boxes.service.js';
import { UnknownBoxError } from './errors/unknown-box.error.js';

const BOYZ: CatalogKit = {
  id: 'games-workshop/orks/boyz-2026',
  manufacturer: 'games-workshop',
  name: 'Boyz',
  factionIds: ['warhammer-40000/orks'],
  releases: [{ year: 2026, sku: '50-80' }],
  minis: 10,
  isDraft: false,
  contains: [],
  variants: [
    {
      name: 'Boyz',
      slots: [
        { count: 9, buildsAs: ['Boy'], parts: [], factionIds: [] },
        { count: 1, buildsAs: ['Nob'], parts: [], factionIds: [] },
      ],
    },
  ],
};

function fakeCatalog(kit: CatalogKit, version: number): CatalogKitQueries {
  return {
    searchKits: () => Promise.resolve([]),
    findKits: (ids) => Promise.resolve(ids.includes(kit.id) ? [{ entry: kit, version, isRemoved: false }] : []),
    findKitVersion: () => Promise.resolve(undefined),
    findFactions: () => Promise.resolve([]),
    findKitParts: () => Promise.resolve([]),
    findFactionNames: () => Promise.resolve(new Map()),
    findSystemNames: () => Promise.resolve(new Map()),
  };
}

describe('Boxes', () => {
  it('adds boxes of the latest version of a catalog kit, each with the minis it puts on the sprue', async () => {
    const addBoxes = vi.fn<HoardRepository['addBoxes']>(() => Promise.resolve());
    const hoard = {
      findBoxes: vi.fn(() => Promise.resolve([])),
      findMinis: vi.fn(),
      findMinisByIds: vi.fn(),
      findParts: vi.fn(),
      addBoxes,
      updateMinis: vi.fn(),
    };
    const service = new BoxesService(hoard, fakeCatalog(BOYZ, 3));

    const { boxes, minis } = await service.add('owner', {
      kitId: BOYZ.id,
      boxes: 1,
      tags: [],
      addedOn: '2026-10-25',
    });

    expect(boxes.map((box) => box.kit)).toEqual([{ id: BOYZ.id, version: 3, name: 'Boyz (2026)', sku: '50-80' }]);
    expect(minis.map((mini) => mini.name)).toEqual([...Array<string>(9).fill('Boy'), 'Nob']);
    expect(minis.every((mini) => mini.boxId === boxes[0]?.id)).toBe(true);
    expect(addBoxes).toHaveBeenCalledWith('owner', boxes, minis);
  });

  it('deletes a box with all its minis', async () => {
    const box: Box = {
      id: 'boyz',
      name: 'Boyz',
      factionIds: [],
      tags: [],
      addedOn: '2026-10-25',
      number: 1,
    };
    const minis: Mini[] = ['boy', 'nob'].map((id) => ({
      id,
      name: id,
      factionIds: [],
      status: 'sprue',
      parts: [],
      boxId: 'boyz',
      isOnWorkbench: false,
    }));
    const deleteBox = vi.fn<HoardRepository['deleteBox']>(() => Promise.resolve(['boy', 'nob']));
    const hoard = {
      findBoxes: vi.fn(() => Promise.resolve([box])),
      findMinis: vi.fn(() => Promise.resolve(minis)),
      findMinisByIds: vi.fn(),
      findParts: vi.fn(),
      addBoxes: vi.fn(),
      updateMinis: vi.fn(),
      deleteMinis: vi.fn(),
      deleteBox,
    };
    const service = new BoxesService(hoard, fakeCatalog(BOYZ, 3));

    const { deletedMiniIds } = await service.delete('owner', 'boyz');

    expect(deleteBox).toHaveBeenCalledWith('owner', 'boyz', expect.objectContaining({ changed: [] }));
    expect(deletedMiniIds).toEqual(['boy', 'nob']);
  });

  it('refuses to delete a box that is not in the hoard', async () => {
    const deleteBox = vi.fn<HoardRepository['deleteBox']>();
    const hoard = {
      findBoxes: vi.fn(() => Promise.resolve([])),
      findMinis: vi.fn(() => Promise.resolve([])),
      findMinisByIds: vi.fn(),
      findParts: vi.fn(),
      addBoxes: vi.fn(),
      updateMinis: vi.fn(),
      deleteMinis: vi.fn(),
      deleteBox,
    };
    const service = new BoxesService(hoard, fakeCatalog(BOYZ, 3));

    const remove = service.delete('owner', 'someone-elses-box');

    await expect(remove).rejects.toThrow(UnknownBoxError);
    expect(deleteBox).not.toHaveBeenCalled();
  });

  it('numbers new boxes after the boxes of the same name', async () => {
    const existing: Box = {
      id: 'boyz-2',
      name: 'Boyz (2026)',
      factionIds: [],
      tags: [],
      addedOn: '2026-10-01',
      number: 2,
    };
    const hoard = {
      findBoxes: vi.fn(() => Promise.resolve([existing])),
      findMinis: vi.fn(),
      findMinisByIds: vi.fn(),
      findParts: vi.fn(),
      addBoxes: vi.fn<HoardRepository['addBoxes']>(() => Promise.resolve()),
      updateMinis: vi.fn(),
      deleteMinis: vi.fn(),
      deleteBox: vi.fn(),
    };
    const service = new BoxesService(hoard, fakeCatalog(BOYZ, 3));

    const { boxes } = await service.add('owner', {
      kitId: BOYZ.id,
      boxes: 2,
      tags: [],
      addedOn: '2026-10-25',
    });

    expect(boxes.map((box) => box.number)).toEqual([3, 4]);
  });
});
