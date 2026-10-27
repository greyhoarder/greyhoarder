import type { BoxRow } from './box-row';
import { sortBoxes } from './box-sort';

const box = (id: string, number: number): BoxRow => ({
  id,
  name: 'Boyz (2026)',
  factions: ['Orks'],
  minis: { sprue: 10 },
  addedOn: '2026-10-25',
  tags: [],
  number,
});

describe('Sorting boxes', () => {
  it('sorts boxes with the same name by their number', () => {
    const boxes = [box('b2', 2), box('b1', 1), box('b3', 3)];

    const sorted = sortBoxes(boxes, 'name', 'ascending');

    expect(sorted.map((each) => each.number)).toEqual([1, 2, 3]);
  });
});
