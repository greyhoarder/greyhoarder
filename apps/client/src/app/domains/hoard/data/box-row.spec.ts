import type { Box } from '../models/box';
import type { Mini } from '../models/mini';
import { toBoxRows } from './box-row';

const ORKS = 'warhammer-40000/orks';
const NAMES = new Map([[ORKS, 'Orks']]);

function box(id: string, factionIds: readonly string[] = [ORKS]): Box {
  return { id, name: `Box ${id}`, factionIds, tags: [], addedOn: '2026-10-24' };
}

function mini(id: string, mini: Pick<Mini, 'status'> & Partial<Mini>): Mini {
  return { id, name: 'Boy', factionIds: [ORKS], parts: [], isOnWorkbench: false, ...mini };
}

describe('Box rows', () => {
  it('counts the minis of each box by their status', () => {
    const minis = [
      mini('1', { boxId: 'a', status: 'sprue' }),
      mini('2', { boxId: 'a', status: 'sprue' }),
      mini('3', { boxId: 'a', status: 'built' }),
      mini('4', { boxId: 'b', status: 'painted' }),
    ];

    const rows = toBoxRows([box('a'), box('b')], minis, NAMES);

    expect(rows.map((row) => row.minis)).toEqual([{ sprue: 2, built: 1 }, { painted: 1 }]);
  });

  it('leaves minis without a box out of every box', () => {
    const minis = [mini('1', { boxId: 'a', status: 'sprue' }), mini('2', { status: 'sprue' })];

    const rows = toBoxRows([box('a')], minis, NAMES);

    expect(rows.map((row) => row.minis)).toEqual([{ sprue: 1 }]);
  });

  it('shows the factions of a box by name, leaving out unknown ones', () => {
    const minis = [mini('1', { boxId: 'a', status: 'sprue' })];

    const rows = toBoxRows([box('a', [ORKS, 'warhammer-40000/unknown'])], minis, NAMES);

    expect(rows.map((row) => row.factions)).toEqual([['Orks']]);
  });
});
