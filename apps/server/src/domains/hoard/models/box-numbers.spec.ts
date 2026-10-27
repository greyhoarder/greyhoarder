import type { Box } from '@greyhoarder/domain/hoard';
import { nextBoxNumber } from './box-numbers.js';

const box = (name: string, number: number): Box => ({
  id: `${name}-${number}`,
  name,
  factionIds: [],
  tags: [],
  addedOn: '2026-10-25',
  number,
});

describe('Box numbers', () => {
  it('numbers the first box of a name 1', () => {
    const next = nextBoxNumber([], 'Boyz (2026)');

    expect(next).toBe(1);
  });

  it('gives a new box the highest number of its name plus one', () => {
    const next = nextBoxNumber([box('Boyz (2026)', 1), box('Boyz (2026)', 3)], 'Boyz (2026)');

    expect(next).toBe(4);
  });

  it('counts only boxes with the same name', () => {
    const next = nextBoxNumber([box('Nobz', 5), box('Boyz (2026)', 1)], 'Boyz (2026)');

    expect(next).toBe(2);
  });
});
