import { EmptyBoxError } from './errors/empty-box.error.js';
import { InvalidRowsError } from './errors/invalid-rows.error.js';
import type { Kit } from './kit.js';
import { newBoxes } from './new-box.js';

const KIT_WITHOUT_SLOTS: Kit = {
  id: 'games-workshop/orks/broken-2024',
  version: 1,
  name: 'Broken',
  names: ['Broken'],
  manufacturer: 'games-workshop',
  factionIds: ['warhammer-40000/orks'],
  isDraft: true,
  variants: [],
  minis: 5,
  contains: [],
};

const ORKS = 'warhammer-40000/orks';
const GROTS = 'warhammer-40000/grots';

const BOYZ: Kit = {
  id: 'games-workshop/orks/boyz-2026',
  version: 3,
  name: 'Boyz',
  names: ['Boyz'],
  manufacturer: 'games-workshop',
  factionIds: [ORKS, GROTS],
  year: 2026,
  isDraft: false,
  variants: [
    {
      name: 'Boyz',
      slots: [
        { count: 9, names: ['Boy'], parts: [], factionIds: [] },
        { count: 1, names: ['Nob'], parts: [], factionIds: [GROTS] },
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
  factionIds: [ORKS],
  isDraft: false,
  variants: [
    {
      name: 'Lootas',
      slots: [
        { count: 4, names: ['Loota'], parts: [], factionIds: [] },
        { count: 1, names: ['Spanner'], parts: [], factionIds: [] },
      ],
      minis: 5,
    },
    {
      name: 'Burna Boyz',
      slots: [
        { count: 4, names: ['Burna Boy'], parts: [], factionIds: [] },
        { count: 1, names: ['Spanner'], parts: [], factionIds: [] },
      ],
      minis: 5,
    },
  ],
  minis: 5,
  contains: [],
};

function addBoyz(boxes: number) {
  let id = 0;
  return newBoxes(BOYZ, { boxes, tags: [] }, { addedOn: '2026-10-24', newId: () => `${++id}` });
}

describe('New boxes', () => {
  it('refuses to add a box without referenced minis', () => {
    const add = () => newBoxes(KIT_WITHOUT_SLOTS, { boxes: 1, tags: [] }, { addedOn: '2026-10-24', newId: () => 'id' });

    expect(add).toThrow(EmptyBoxError);
  });

  it('puts one mini per miniature of the kit on the sprue, each from its own box', () => {
    const { boxes, minis } = addBoyz(2);

    expect(minis).toHaveLength(20);
    expect(minis.every((mini) => mini.status === 'sprue')).toBe(true);
    expect(boxes.map((box) => minis.filter((mini) => mini.boxId === box.id).length)).toEqual([10, 10]);
  });

  it('records the kit and its version on each box', () => {
    const { boxes } = addBoyz(1);

    expect(boxes.map((box) => box.kit && [box.kit.id, box.kit.version])).toEqual([[BOYZ.id, 3]]);
  });

  it("gives a mini its slot's factions, otherwise the kit's first one", () => {
    const { minis } = addBoyz(1);

    const factionsByName = new Map(minis.map((mini) => [mini.name, mini.factionIds]));

    expect(Object.fromEntries(factionsByName)).toEqual({ Boy: [ORKS], Nob: [GROTS] });
  });

  it('names the minis of a slot that every variant of an either-or kit has after that slot', () => {
    const { minis } = newBoxes(
      LOOTAS_OR_BURNA_BOYZ,
      { boxes: 1, tags: [] },
      { addedOn: '2026-10-24', newId: () => 'id' },
    );

    expect(minis.map((mini) => mini.name)).toEqual([
      'Lootas / Burna Boyz',
      'Lootas / Burna Boyz',
      'Lootas / Burna Boyz',
      'Lootas / Burna Boyz',
      'Spanner',
    ]);
  });

  it('remembers the name each mini got on the sprue', () => {
    const { minis } = addBoyz(1);

    expect(minis.map((mini) => mini.sprueName)).toEqual([...Array<string>(9).fill('Boy'), 'Nob']);
  });

  it('numbers the boxes it adds from the given number', () => {
    let id = 0;

    const { boxes } = newBoxes(
      BOYZ,
      { boxes: 2, tags: [] },
      { addedOn: '2026-10-24', newId: () => `${++id}`, firstNumber: 3 },
    );

    expect(boxes.map((box) => box.number)).toEqual([3, 4]);
  });

  it('puts as many minis of a row on the sprue as counted', () => {
    const { minis } = newBoxes(BOYZ, { boxes: 1, tags: [], rows: [7, 1] }, context());

    expect(minis.map((mini) => mini.name)).toEqual([...Array<string>(7).fill('Boy'), 'Nob']);
  });

  it('gives every box the counted rows', () => {
    const { boxes, minis } = newBoxes(BOYZ, { boxes: 2, tags: [], rows: [7, 0] }, context());

    expect(boxes.map((box) => minis.filter((mini) => mini.boxId === box.id).length)).toEqual([7, 7]);
  });

  it('refuses to add a box whose rows are all at none', () => {
    const add = () => newBoxes(BOYZ, { boxes: 1, tags: [], rows: [0, 0] }, context());

    expect(add).toThrow(EmptyBoxError);
  });

  it('refuses rows that do not fit the kit', () => {
    const adds = [[9], [9, -1], [9, 0.5]].map((rows) => () => newBoxes(BOYZ, { boxes: 1, tags: [], rows }, context()));

    adds.forEach((add) => expect(add).toThrow(InvalidRowsError));
  });

  it('names the boxes as chosen', () => {
    const { boxes } = newBoxes(BOYZ, { boxes: 2, tags: [], name: ' Boyz from Dad ' }, context());

    expect(boxes.map((box) => box.name)).toEqual(['Boyz from Dad', 'Boyz from Dad']);
  });

  it('marks a box as edited when its rows differ from its kit', () => {
    const { boxes } = newBoxes(BOYZ, { boxes: 1, tags: [], rows: [7, 1] }, context());

    expect(boxes[0]?.isEdited).toBe(true);
  });

  it('does not mark a box as edited when its rows are as its kit describes', () => {
    const { boxes } = newBoxes(BOYZ, { boxes: 1, tags: [], rows: [9, 1] }, context());

    expect(boxes[0]?.isEdited).toBeFalsy();
  });

  it('marks a box of sprues as edited, also when counted as its kit describes', () => {
    const { boxes } = newBoxes(BOYZ, { boxes: 1, tags: [], rows: [9, 1], areSprues: true }, context());

    expect(boxes[0]?.isEdited).toBe(true);
  });

  it('names counted undecided minis of an either-or kit after the kit', () => {
    const { minis } = newBoxes(LOOTAS_OR_BURNA_BOYZ, { boxes: 1, tags: [], rows: [3, 0], areSprues: true }, context());

    expect(minis.map((mini) => [mini.name, mini.sprueName])).toEqual(
      Array.from({ length: 3 }, () => ['Lootas / Burna Boyz', 'Lootas / Burna Boyz']),
    );
  });

  it('puts only the counted rows of a bundle on the sprue', () => {
    const { minis } = newBoxes(STARTER, { boxes: 1, tags: [], rows: [0, 10, 1] }, context());

    expect(minis.map((mini) => mini.name)).toEqual([...Array<string>(10).fill('Boy'), 'Nob']);
  });
});

const MARINES = 'warhammer-40000/space-marines';

/** A starter set with Space Marines of its own and a box of Boyz. */
const STARTER: Kit = {
  id: 'games-workshop/starter-2026',
  version: 1,
  name: 'Starter',
  names: ['Starter'],
  manufacturer: 'games-workshop',
  factionIds: [MARINES, ORKS],
  isDraft: false,
  variants: [{ name: 'Starter', slots: [{ count: 5, names: ['Marine'], parts: [], factionIds: [MARINES] }], minis: 5 }],
  minis: 15,
  contains: [{ kit: BOYZ, count: 1 }],
};

function context() {
  let id = 0;
  return { addedOn: '2026-10-24', newId: () => `${++id}` };
}
