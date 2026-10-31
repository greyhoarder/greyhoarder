import type { Kit } from './kit.js';
import { matchingRows } from './matching-rows.js';

const ORKS = 'warhammer-40000/orks';

const BOYZ: Kit = {
  id: 'games-workshop/orks/boyz-2026',
  version: 3,
  name: 'Boyz',
  names: ['Boyz'],
  manufacturer: 'games-workshop',
  factionIds: [ORKS],
  isDraft: false,
  variants: [
    {
      name: 'Boyz',
      slots: [
        { count: 9, names: ['Boy', 'Boss Nob'], parts: [], factionIds: [] },
        { count: 1, names: ['Ammo Runt'], parts: [], factionIds: [] },
      ],
      minis: 10,
    },
  ],
  minis: 10,
  contains: [],
};

const STARTER: Kit = {
  id: 'games-workshop/starter-2026',
  version: 1,
  name: 'Starter',
  names: ['Starter'],
  manufacturer: 'games-workshop',
  factionIds: [ORKS],
  isDraft: false,
  variants: [{ name: 'Starter', slots: [{ count: 1, names: ['Warboss'], parts: [], factionIds: [] }], minis: 1 }],
  minis: 11,
  contains: [{ kit: BOYZ, count: 1 }],
};

describe('Matching rows', () => {
  it('names the slots of a kit that can be built as the search, ignoring case', () => {
    const rows = matchingRows(BOYZ, 'nob');

    expect(rows).toEqual([0]);
  });

  it('names the matching slots of the kits in a bundle', () => {
    const rows = matchingRows(STARTER, 'Nob');

    expect(rows).toEqual([1]);
  });
});
