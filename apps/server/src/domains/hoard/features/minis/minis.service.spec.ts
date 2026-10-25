import type { Mini } from '@greyhoarder/domain/hoard';
import type { CatalogKitQueries } from '../../../catalog/api/index.js';
import { MinisService } from './minis.service.js';

const BOY: Mini = {
  id: 'boy',
  name: 'Boy',
  factionIds: ['warhammer-40000/orks'],
  status: 'sprue',
  parts: [],
  isOnWorkbench: false,
};

const CATALOG: CatalogKitQueries = {
  searchKits: () => Promise.resolve([]),
  findKits: () => Promise.resolve([]),
  findKitVersion: () => Promise.resolve(undefined),
  findFactionNames: () => Promise.resolve(new Map([['warhammer-40000/orks', 'Orks']])),
  findSystemNames: (factionIds) =>
    Promise.resolve(
      new Map(factionIds.includes('warhammer-40000/orks') ? [['warhammer-40000/orks', 'Warhammer 40,000']] : []),
    ),
};

describe('Minis service', () => {
  it('lists the game system names of the factions its minis refer to', async () => {
    const hoard = { findBoxes: vi.fn(), findMinis: vi.fn(() => Promise.resolve([BOY])), addBoxes: vi.fn() };
    const service = new MinisService(hoard, CATALOG);

    const { systemNames } = await service.list('owner');

    expect(systemNames).toEqual(new Map([['warhammer-40000/orks', 'Warhammer 40,000']]));
  });
});
