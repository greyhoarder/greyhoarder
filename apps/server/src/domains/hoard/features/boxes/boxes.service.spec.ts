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

const BOX: Box = { id: 'boyz', name: 'Boyz', factionIds: [], tags: [], addedOn: '2026-10-25', number: 1 };

function miniOf(boxId: string, id: string, status: Mini['status']): Mini {
  return { id, name: id, factionIds: [], status, parts: [], boxId, isOnWorkbench: false };
}

/** A hoard of these boxes and minis, deleting boxes as `deleteBoxes` does. */
function hoardOf(boxes: readonly Box[], minis: readonly Mini[], deleteBoxes: HoardRepository['deleteBoxes']) {
  return {
    findBoxes: vi.fn(() => Promise.resolve(boxes)),
    findMinis: vi.fn(() => Promise.resolve(minis)),
    findMinisByIds: vi.fn(),
    findParts: vi.fn(),
    addBoxes: vi.fn(),
    updateMinis: vi.fn(),
    deleteMinis: vi.fn(),
    deleteBoxes,
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

    const deleteBoxes = vi.fn<HoardRepository['deleteBoxes']>(() => Promise.resolve(['boy', 'nob']));

    const hoard = {
      findBoxes: vi.fn(() => Promise.resolve([box])),
      findMinis: vi.fn(() => Promise.resolve(minis)),
      findMinisByIds: vi.fn(),
      findParts: vi.fn(),
      addBoxes: vi.fn(),
      updateMinis: vi.fn(),
      deleteMinis: vi.fn(),
      deleteBoxes,
    };

    const service = new BoxesService(hoard, fakeCatalog(BOYZ, 3));

    const { deletedMiniIds } = await service.delete('owner', ['boyz']);

    expect(deleteBoxes).toHaveBeenCalledWith('owner', ['boyz'], expect.objectContaining({ changed: [] }));
    expect(deletedMiniIds).toEqual(['boy', 'nob']);
  });

  it('refuses to delete a box that is not in the hoard', async () => {
    const deleteBoxes = vi.fn<HoardRepository['deleteBoxes']>();

    const hoard = {
      findBoxes: vi.fn(() => Promise.resolve([])),
      findMinis: vi.fn(() => Promise.resolve([])),
      findMinisByIds: vi.fn(),
      findParts: vi.fn(),
      addBoxes: vi.fn(),
      updateMinis: vi.fn(),
      deleteMinis: vi.fn(),
      deleteBoxes,
    };

    const service = new BoxesService(hoard, fakeCatalog(BOYZ, 3));

    const remove = service.delete('owner', ['someone-elses-box']);

    await expect(remove).rejects.toThrow(UnknownBoxError);
    expect(deleteBoxes).not.toHaveBeenCalled();
  });

  it('deletes several boxes with all their minis in one go', async () => {
    const boxes = ['boyz', 'nobz'].map((id, index): Box => ({ ...BOX, id, number: index + 1 }));
    const minis = [miniOf('boyz', 'boy', 'built'), miniOf('nobz', 'nob', 'sprue')];
    const deleteBoxes = vi.fn<HoardRepository['deleteBoxes']>(() => Promise.resolve(['boy', 'nob']));
    const service = new BoxesService(hoardOf(boxes, minis, deleteBoxes), fakeCatalog(BOYZ, 3));

    const { deletedMiniIds } = await service.delete('owner', ['boyz', 'nobz']);

    expect(deleteBoxes).toHaveBeenCalledOnce();
    expect(deleteBoxes).toHaveBeenCalledWith('owner', ['boyz', 'nobz'], expect.objectContaining({ keptMinis: [] }));
    expect(deletedMiniIds).toEqual(['boy', 'nob']);
  });

  it('deletes several boxes and keeps their minis past the sprue when asked', async () => {
    const boxes = ['boyz', 'nobz'].map((id, index): Box => ({ ...BOX, id, number: index + 1 }));
    const minis = [miniOf('boyz', 'boy', 'built'), miniOf('nobz', 'nob', 'built'), miniOf('nobz', 'grot', 'sprue')];
    const deleteBoxes = vi.fn<HoardRepository['deleteBoxes']>(() => Promise.resolve(['grot']));
    const service = new BoxesService(hoardOf(boxes, minis, deleteBoxes), fakeCatalog(BOYZ, 3));

    const deletion = await service.delete('owner', ['boyz', 'nobz'], { keepBuiltMinis: true });

    expect(deletion.deletedMiniIds).toEqual(['grot']);
    expect(deletion.minis.map((mini) => [mini.id, mini.boxId])).toEqual([
      ['boy', undefined],
      ['nob', undefined],
    ]);
    expect(deleteBoxes).toHaveBeenCalledWith(
      'owner',
      ['boyz', 'nobz'],
      expect.objectContaining({ keptMinis: deletion.minis }),
    );
  });

  it('deletes nothing when one of the boxes is not in the hoard', async () => {
    const deleteBoxes = vi.fn<HoardRepository['deleteBoxes']>();
    const service = new BoxesService(hoardOf([BOX], [], deleteBoxes), fakeCatalog(BOYZ, 3));

    const remove = service.delete('owner', [BOX.id, 'someone-elses-box']);

    await expect(remove).rejects.toThrow(UnknownBoxError);
    expect(deleteBoxes).not.toHaveBeenCalled();
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
      deleteBoxes: vi.fn(),
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

  it('numbers new boxes after the boxes of the name chosen for them', async () => {
    const existing: Box = {
      id: 'boyz-from-dad',
      name: 'Boyz from Dad',
      factionIds: [],
      tags: [],
      addedOn: '2026-10-01',
      number: 1,
    };

    const hoard = {
      findBoxes: vi.fn(() => Promise.resolve([existing])),
      findMinis: vi.fn(),
      findMinisByIds: vi.fn(),
      findParts: vi.fn(),
      addBoxes: vi.fn<HoardRepository['addBoxes']>(() => Promise.resolve()),
      updateMinis: vi.fn(),
      deleteMinis: vi.fn(),
      deleteBoxes: vi.fn(),
    };

    const service = new BoxesService(hoard, fakeCatalog(BOYZ, 3));

    const { boxes } = await service.add('owner', {
      kitId: BOYZ.id,
      boxes: 1,
      tags: [],
      addedOn: '2026-10-25',
      name: 'Boyz from Dad',
    });

    expect(boxes.map((box) => [box.name, box.number])).toEqual([['Boyz from Dad', 2]]);
  });

  it('deletes a box and keeps its minis past the sprue when asked', async () => {
    const box: Box = {
      id: 'boyz',
      name: 'Boyz (2026)',
      kit: { id: BOYZ.id, version: 3, name: 'Boyz (2026)', sku: '50-80' },
      factionIds: [],
      tags: [],
      addedOn: '2026-10-25',
      number: 1,
    };

    const minis: Mini[] = [
      { id: 'boy', name: 'Boy', factionIds: [], status: 'sprue', parts: [], boxId: 'boyz', isOnWorkbench: false },
      { id: 'nob', name: 'Nob', factionIds: [], status: 'built', parts: [], boxId: 'boyz', isOnWorkbench: false },
    ];

    const deleteBoxes = vi.fn<HoardRepository['deleteBoxes']>(() => Promise.resolve(['boy']));

    const hoard = {
      findBoxes: vi.fn(() => Promise.resolve([box])),
      findMinis: vi.fn(() => Promise.resolve(minis)),
      findMinisByIds: vi.fn(),
      findParts: vi.fn(),
      addBoxes: vi.fn(),
      updateMinis: vi.fn(),
      deleteMinis: vi.fn(),
      deleteBoxes,
    };

    const service = new BoxesService(hoard, fakeCatalog(BOYZ, 3));

    const deletion = await service.delete('owner', ['boyz'], { keepBuiltMinis: true });

    expect(deletion.deletedMiniIds).toEqual(['boy']);
    expect(deletion.minis).toEqual([
      { id: 'nob', name: 'Nob', factionIds: [], status: 'built', parts: [], kit: box.kit, isOnWorkbench: false },
    ]);
    expect(deleteBoxes).toHaveBeenCalledWith('owner', ['boyz'], expect.objectContaining({ keptMinis: deletion.minis }));
  });

  it('removes the steps of the minis deleted with a box', async () => {
    const box: Box = { id: 'boyz', name: 'Boyz', factionIds: [], tags: [], addedOn: '2026-10-25', number: 1 };

    const mini: Mini = {
      id: 'boy',
      name: 'Boy',
      factionIds: [],
      status: 'painted',
      parts: [],
      boxId: 'boyz',
      isOnWorkbench: false,
    };

    const deleteBoxes = vi.fn<HoardRepository['deleteBoxes']>(() => Promise.resolve(['boy']));

    const hoard = {
      findBoxes: vi.fn(() => Promise.resolve([box])),
      findMinis: vi.fn(() => Promise.resolve([mini])),
      findMinisByIds: vi.fn(),
      findParts: vi.fn(),
      addBoxes: vi.fn(),
      updateMinis: vi.fn(),
      deleteMinis: vi.fn(),
      deleteBoxes,
    };

    const service = new BoxesService(hoard, fakeCatalog(BOYZ, 3));

    await service.delete('owner', ['boyz']);

    expect(deleteBoxes.mock.calls[0]?.[2].steps?.undone).toEqual([
      { miniId: 'boy', statuses: ['built', 'primed', 'painted', 'done'] },
    ]);
  });
});
