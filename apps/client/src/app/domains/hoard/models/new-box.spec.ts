import { EmptyBoxError } from './empty-box.error';
import type { Kit } from './kit';
import { newBoxes } from './new-box';

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

function addBoyz(boxes: number) {
  let id = 0;
  return newBoxes(BOYZ, { boxes, tags: [] }, { addedOn: '2026-10-24', newId: () => `${++id}` });
}

describe('New boxes', () => {
  it('refuses to add a box without referenced minis', () => {
    const add = () => newBoxes(
        KIT_WITHOUT_SLOTS,
        { boxes: 1, tags: [] },
        { addedOn: '2026-10-24', newId: () => 'id' },
      );

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
});
