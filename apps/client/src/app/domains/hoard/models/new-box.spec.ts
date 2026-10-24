import { EmptyBoxError } from './empty-box.error';
import type { Kit } from './kit';
import { newBoxes } from './new-box';

const KIT_WITHOUT_SLOTS: Kit = {
  id: 'games-workshop/orks/broken-2024',
  name: 'Broken',
  names: ['Broken'],
  manufacturer: 'games-workshop',
  factionIds: ['warhammer-40000/orks'],
  isDraft: true,
  variants: [],
  minis: 5,
  contains: [],
};

describe('New boxes', () => {
  it('refuses to add a box without referenced minis', () => {
    const add = () => newBoxes(
        KIT_WITHOUT_SLOTS,
        { boxes: 1, tags: [] },
        { addedOn: '2026-10-24', newId: () => 'id', factionNames: new Map() },
      );

    expect(add).toThrow(EmptyBoxError);
  });
});
