import type { CatalogKit } from '@greyhoarder/domain/catalog';
import type { CatalogKitQueries } from '../../../catalog/api/index.js';
import type { HoardRepository } from '../../ports/hoard-repository.js';
import { BoxesService } from './boxes.service.js';

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
    findKits: (ids) =>
      Promise.resolve(ids.includes(kit.id) ? [{ entry: kit, version, isRemoved: false }] : []),
    findKitVersion: () => Promise.resolve(undefined),
    findFactionNames: () => Promise.resolve(new Map()),
    findSystemNames: () => Promise.resolve(new Map()),
  };
}

describe('Boxes', () => {
  it('adds boxes of the latest version of a catalog kit, each with the minis it puts on the sprue', async () => {
    const addBoxes = vi.fn<HoardRepository['addBoxes']>(() => Promise.resolve());
    const hoard = { findBoxes: vi.fn(), findMinis: vi.fn(), addBoxes };
    const service = new BoxesService(hoard, fakeCatalog(BOYZ, 3));

    const { boxes, minis } = await service.add('owner', {
      kitId: BOYZ.id,
      boxes: 1,
      tags: [],
      addedOn: '2026-10-25',
    });

    expect(boxes.map((box) => box.kit)).toEqual([
      { id: BOYZ.id, version: 3, name: 'Boyz (2026)', sku: '50-80' },
    ]);
    expect(minis.map((mini) => mini.name)).toEqual([...Array<string>(9).fill('Boy'), 'Nob']);
    expect(minis.every((mini) => mini.boxId === boxes[0]?.id)).toBe(true);
    expect(addBoxes).toHaveBeenCalledWith('owner', boxes, minis);
  });
});
