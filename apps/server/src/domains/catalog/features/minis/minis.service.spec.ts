import type { CatalogKit } from '@greyhoarder/domain/catalog';
import type { CatalogKitQueries } from '../../ports/catalog-kit-queries.js';
import { MinisService } from './minis.service.js';

/** A box of Boyz released in that year, whose slot builds Boys. */
const boyz = (year: number): CatalogKit => ({
  id: `games-workshop/orks/boyz-${year}`,
  manufacturer: 'games-workshop',
  name: 'Boyz',
  factionIds: ['warhammer-40000/orks'],
  releases: [{ year }],
  minis: 10,
  isDraft: false,
  contains: [],
  variants: [{ name: 'Boyz', slots: [{ count: 10, buildsAs: ['Boy'], parts: ['Slugga'], factionIds: [] }] }],
});

describe('Minis service', () => {
  it('finds a mini once per kit it comes from, the newest kit first', async () => {
    const catalog = {
      searchFactions: () => Promise.resolve([]),
      searchKitsByMini: () =>
        Promise.resolve([
          { entry: boyz(2008), version: 1, isRemoved: false },
          { entry: boyz(2026), version: 2, isRemoved: false },
        ]),
      findFactionNames: () => Promise.resolve(new Map([['warhammer-40000/orks', 'Orks']])),
      findSystemNames: () => Promise.resolve(new Map()),
    } as unknown as CatalogKitQueries;
    const service = new MinisService(catalog);

    const { minis } = await service.search('boy');

    expect(minis.map((mini) => [mini.name, mini.kit.year, mini.kit.version])).toEqual([
      ['Boy', 2026, 2],
      ['Boy', 2008, 1],
    ]);
  });
});
