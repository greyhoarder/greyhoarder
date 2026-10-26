import type { Kit, KitSlot, Mini } from '@greyhoarder/domain/hoard';
import { buildSuggestions, preselectedParts } from './mini-build';

const slot = (count: number, names: string[], parts: string[]): KitSlot => ({
  count,
  names,
  parts,
  factionIds: [],
});

const LOOTAS: Kit = {
  id: 'games-workshop/orks/lootas-2008',
  version: 1,
  name: 'Lootas',
  names: ['Lootas', 'Burna Boyz'],
  manufacturer: 'games-workshop',
  factionIds: ['warhammer-40000/orks'],
  year: 2008,
  isDraft: true,
  variants: [
    {
      name: 'Lootas',
      slots: [
        slot(4, ['Loota'], ['Deffgun']),
        slot(1, ['Spanner'], ['Big Shoota', 'Rokkit Launcha']),
      ],
      minis: 5,
    },
    {
      name: 'Burna Boyz',
      slots: [
        slot(4, ['Burna Boy'], ['Burna']),
        slot(1, ['Spanner'], ['Big Shoota', 'Rokkit Launcha']),
      ],
      minis: 5,
    },
  ],
  minis: 5,
  contains: [],
};

const BOYZ: Kit = {
  ...LOOTAS,
  id: 'games-workshop/orks/boyz',
  name: 'Boyz',
  names: ['Boyz'],
  variants: [{ name: 'Boyz', slots: [slot(9, ['Boy'], ['Slugga', 'Choppa'])], minis: 9 }],
  minis: 9,
};

/** A Trukk of its own and a box of Boyz in it. */
const BATTLEFORCE: Kit = {
  ...LOOTAS,
  id: 'games-workshop/orks/battleforce',
  name: 'Battleforce',
  names: ['Battleforce'],
  variants: [{ name: 'Battleforce', slots: [slot(1, ['Trukk'], ['Big Shoota'])], minis: 10 }],
  minis: 10,
  contains: [{ kit: BOYZ, count: 1 }],
};

const mini = (id: string, overrides: Partial<Mini>): Mini => ({
  id,
  name: 'Lootas / Burna Boyz',
  factionIds: ['warhammer-40000/orks'],
  status: 'sprue',
  parts: [],
  sprueName: 'Lootas / Burna Boyz',
  boxId: 'b1',
  isOnWorkbench: false,
  ...overrides,
});

const leftOf = (minis: readonly Mini[], name: string) =>
  buildSuggestions(LOOTAS, minis).find((suggestion) => suggestion.name === name)?.left;

describe('Build suggestions', () => {
  const namesFor = (kit: Kit, sprueName: string) =>
    buildSuggestions(kit, [], sprueName).map((suggestion) => suggestion.name);

  it("suggests what the minis' slot can be built as", () => {
    const names = namesFor(LOOTAS, 'Lootas / Burna Boyz');

    expect(names).toEqual(['Loota', 'Burna Boy']);
  });

  it('suggests a mini of a bundle only the names of its own slot', () => {
    const names = namesFor(BATTLEFORCE, 'Boy');

    expect(names).toEqual(['Boy']);
  });

  it('suggests every name of the kit when it put no minis of the sprue name on the sprue', () => {
    const names = namesFor(LOOTAS, 'Tankbusta');

    expect(names).toEqual(['Loota', 'Spanner', 'Burna Boy']);
  });

  it('counts how many minis the kit provides for a name, in the variant that provides the most', () => {
    const suggestions = buildSuggestions(LOOTAS, []);

    expect(suggestions.map((suggestion) => suggestion.left)).toEqual([4, 1, 4]);
  });

  it('counts the minis of the box built as a name as used up', () => {
    const left = leftOf([mini('m1', { name: 'Loota', status: 'built' })], 'Loota');

    expect(left).toBe(3);
  });

  it('counts a mini built under an own name as using up the name it had on the sprue', () => {
    const left = leftOf(
      [mini('m1', { name: 'Tankbusta', sprueName: 'Loota', status: 'built' })],
      'Loota',
    );

    expect(left).toBe(3);
  });

  it('counts a mini built from an either-or slot as using up every name of that slot', () => {
    const left = leftOf(
      [mini('m1', { name: 'Loota', sprueName: 'Lootas / Burna Boyz', status: 'built' })],
      'Burna Boy',
    );

    expect(left).toBe(3);
  });

  it('never counts below none left', () => {
    const left = leftOf(
      [
        mini('m1', { name: 'Spanner', status: 'built' }),
        mini('m2', { name: 'Spanner', status: 'primed' }),
      ],
      'Spanner',
    );

    expect(left).toBe(0);
  });
});

describe('Preselected parts', () => {
  it('takes the parts of the mini most recently built as the name', () => {
    const minis = [
      mini('m1', {
        name: 'Loota',
        status: 'built',
        parts: [{ partId: 'old', isSwappable: false }],
      }),
      mini('m2', { name: 'Loota', status: 'built', parts: [{ partId: 'new', isSwappable: true }] }),
    ];

    const parts = preselectedParts(minis, LOOTAS, 'Loota');

    expect(parts).toEqual([{ partId: 'new', isSwappable: true }]);
  });

  it('takes the only part the kit offers for the name without such a mini', () => {
    const parts = preselectedParts([], LOOTAS, 'Loota');

    expect(parts).toEqual(['Deffgun']);
  });

  it('preselects nothing when the kit offers several parts for the name', () => {
    const parts = preselectedParts([], LOOTAS, 'Spanner');

    expect(parts).toEqual([]);
  });
});
