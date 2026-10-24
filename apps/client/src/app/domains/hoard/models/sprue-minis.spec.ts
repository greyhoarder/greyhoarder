import { sprueMinis } from './sprue-minis';
import type { Kit } from './kit';

const BOYZ: Kit = {
  id: 'games-workshop/orks/boyz-2021',
  version: 1,
  name: 'Boyz',
  names: ['Boyz'],
  manufacturer: 'games-workshop',
  factionIds: ['warhammer-40000/orks'],
  isDraft: false,
  variants: [
    {
      name: 'Boyz',
      slots: [
        { count: 9, names: ['Boy'], parts: [], factionIds: [] },
        { count: 1, names: ['Nob'], parts: [], factionIds: [] },
      ],
      minis: 10,
    },
  ],
  minis: 10,
  contains: [],
};

const LOOTAS_OR_BURNA_BOYZ: Kit = {
  id: 'games-workshop/orks/lootas-2008',
  version: 1,
  name: 'Lootas',
  names: ['Lootas', 'Burna Boyz'],
  manufacturer: 'games-workshop',
  factionIds: ['warhammer-40000/orks'],
  isDraft: false,
  variants: [
    { name: 'Lootas', slots: [{ count: 5, names: ['Loota'], parts: [], factionIds: [] }], minis: 5 },
    { name: 'Burna Boyz', slots: [{ count: 5, names: ['Burna Boy'], parts: [], factionIds: [] }], minis: 5 },
  ],
  minis: 5,
  contains: [],
};

const BATTLEFORCE: Kit = {
  id: 'games-workshop/orks/battleforce-2024',
  version: 1,
  name: 'Battleforce',
  names: ['Battleforce'],
  manufacturer: 'games-workshop',
  factionIds: ['warhammer-40000/orks'],
  isDraft: false,
  variants: [],
  minis: 20,
  contains: [
    { kit: BOYZ, count: 1 },
    { kit: LOOTAS_OR_BURNA_BOYZ, count: 2 },
  ],
};

const INTERCESSORS: Kit = {
  id: 'games-workshop/space-marines/intercessors-2020',
  version: 1,
  name: 'Intercessors',
  names: ['Intercessors'],
  manufacturer: 'games-workshop',
  factionIds: ['warhammer-40000/space-marines'],
  isDraft: false,
  variants: [{ name: 'Intercessors', slots: [{ count: 10, names: ['Intercessor'], parts: [], factionIds: [] }], minis: 10 }],
  minis: 10,
  contains: [],
};

const TERMAGANTS: Kit = {
  id: 'games-workshop/tyranids/termagants-2023',
  version: 1,
  name: 'Termagants',
  names: ['Termagants'],
  manufacturer: 'games-workshop',
  factionIds: ['warhammer-40000/tyranids'],
  isDraft: false,
  variants: [{ name: 'Termagants', slots: [{ count: 10, names: ['Termagant'], parts: [], factionIds: [] }], minis: 10 }],
  minis: 10,
  contains: [],
};

const STARTER_SET: Kit = {
  id: 'games-workshop/warhammer-40000/starter-set-2023',
  version: 1,
  name: 'Starter Set',
  names: ['Starter Set'],
  manufacturer: 'games-workshop',
  factionIds: ['warhammer-40000/space-marines', 'warhammer-40000/tyranids'],
  isDraft: false,
  variants: [],
  minis: 20,
  contains: [
    { kit: INTERCESSORS, count: 1 },
    { kit: TERMAGANTS, count: 1 },
  ],
};

describe('Sprue minis', () => {
  it('puts the minis of bundled kits into the box', () => {
    const rows = sprueMinis(BATTLEFORCE);

    expect(rows.map((row) => `${row.count}× ${row.name}`)).toEqual([
      '9× Boy',
      '1× Nob',
      '10× Lootas / Burna Boyz',
    ]);
  });

  it('gives the minis of a bundled kit the factions they get when that kit is added on its own', () => {
    const rows = sprueMinis(STARTER_SET);

    expect(rows.map((row) => `${row.name}: ${row.factionIds.join()}`)).toEqual([
      'Intercessor: warhammer-40000/space-marines',
      'Termagant: warhammer-40000/tyranids',
    ]);
  });
});
