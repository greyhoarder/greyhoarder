import type { Box } from './box.js';
import { InvalidRowsError } from './errors/invalid-rows.error.js';
import type { Kit } from './kit.js';
import type { Mini } from './mini.js';
import { editedRows, sprueRowCounts } from './box-rows.js';

const ORKS = 'warhammer-40000/orks';

const BOYZ: Kit = {
  id: 'games-workshop/orks/boyz-2026',
  version: 3,
  name: 'Boyz',
  names: ['Boyz'],
  manufacturer: 'games-workshop',
  factionIds: [ORKS],
  year: 2026,
  isDraft: false,
  variants: [
    {
      name: 'Boyz',
      slots: [
        { count: 9, names: ['Boy', 'Boss Nob'], parts: [], factionIds: [] },
        { count: 1, names: ['Nob'], parts: [], factionIds: [] },
      ],
      minis: 10,
    },
  ],
  minis: 10,
  contains: [],
};

const BOX: Box = {
  id: 'b1',
  name: 'Boyz sprues (2026)',
  kit: { id: BOYZ.id, version: 3, name: 'Boyz (2026)' },
  factionIds: [ORKS],
  tags: [],
  addedOn: '2026-10-24',
  number: 1,
};

function mini(id: string, mini: Partial<Mini> = {}): Mini {
  return {
    id,
    name: 'Boy',
    factionIds: [ORKS],
    status: 'sprue',
    parts: [],
    sprueName: 'Boy',
    boxId: BOX.id,
    isOnWorkbench: false,
    ...mini,
  };
}

/** 3 Boys on the sprue, a built Boy and a sold Boy on the sprue. */
const MINIS: Mini[] = [
  mini('1'),
  mini('2'),
  mini('3'),
  mini('4', { status: 'built' }),
  mini('5', { departure: { reason: 'sold', on: '2026-10-25' } }),
];

function edit(rows: readonly number[]) {
  let id = 0;
  return editedRows(BOYZ, BOX, MINIS, rows, () => `new-${++id}`);
}

describe('Rows of a box', () => {
  it('counts the minis on the sprue of a box per row of its kit', () => {
    const counts = sprueRowCounts(BOYZ, MINIS);

    expect(counts).toEqual([3, 0]);
  });

  it('puts further minis on the sprue of a raised row, named as adding the box would', () => {
    const { added } = edit([3, 1]);

    expect(added.map((added) => [added.name, added.sprueName, added.status, added.boxId])).toEqual([
      ['Nob', 'Nob', 'sprue', BOX.id],
    ]);
  });

  it('deletes minis on the sprue of a lowered row', () => {
    const { deletedIds } = edit([1, 0]);

    expect(deletedIds).toHaveLength(2);
    expect(deletedIds.every((id) => ['1', '2', '3'].includes(id))).toBe(true);
  });

  it('leaves built and gone minis alone when their row is lowered', () => {
    const { deletedIds } = edit([0, 0]);

    expect(deletedIds).toEqual(expect.not.arrayContaining(['4', '5']));
  });

  it('marks the box as edited once a row changed', () => {
    const { box } = edit([4, 0]);

    expect(box.isEdited).toBe(true);
  });

  it('changes nothing while every row stays as it was', () => {
    const changes = edit([3, 0]);

    expect(changes).toEqual({ box: BOX, added: [], deletedIds: [] });
  });

  it('refuses rows that do not fit the kit', () => {
    const edits = [[3], [3, -1]].map((rows) => () => edit(rows));

    edits.forEach((edit) => expect(edit).toThrow(InvalidRowsError));
  });

  it("counts the minis of rows with the same name in the kit's order, each up to what it puts on the sprue", () => {
    const boys = Array.from({ length: 12 }, (_, index) => mini(`boy-${index}`));

    const counts = sprueRowCounts(TWO_BOYZ, boys);

    expect(counts).toEqual([2, 10, 0]);
  });
});

/** A bundle with a Boy slot of its own, after Boyz whose first slot is a Boy as well. */
const TWO_BOYZ: Kit = {
  ...BOYZ,
  id: 'games-workshop/orks/two-boyz',
  name: 'Two Boyz',
  names: ['Two Boyz'],
  variants: [{ name: 'Two Boyz', slots: [{ count: 2, names: ['Boy'], parts: [], factionIds: [] }], minis: 2 }],
  minis: 12,
  contains: [{ kit: BOYZ, count: 1 }],
};
