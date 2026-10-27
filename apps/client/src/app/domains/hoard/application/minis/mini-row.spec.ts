import type { Box, Mini } from '@greyhoarder/domain/hoard';
import { toMiniRows } from './mini-row';

const ORKS = 'warhammer-40000/orks';
const NAMES = new Map([
  [ORKS, 'Orks'],
  ['warhammer-40000/space-marines', 'Space Marines'],
]);
const BOXES: Box[] = [
  { id: 'a', name: 'Boyz (2026)', factionIds: [ORKS], tags: [], addedOn: '2026-10-24', number: 1 },
  { id: 'b', name: 'Boyz (2021)', factionIds: [ORKS], tags: [], addedOn: '2026-10-24', number: 1 },
];

function boy(id: string, differs: Partial<Mini> = {}): Mini {
  return {
    id,
    name: 'Boy',
    factionIds: [ORKS],
    status: 'sprue',
    parts: [],
    boxId: 'a',
    isOnWorkbench: false,
    ...differs,
  };
}

describe('Mini rows', () => {
  it('shows alike minis as one row with their count', () => {
    const rows = toMiniRows([boy('1'), boy('2'), boy('3')], BOXES, NAMES);

    expect(rows.map((row) => `${row.count}× ${row.name}`)).toEqual(['3× Boy']);
  });

  it('gives a mini that differs in name, factions, status or parts a row of its own', () => {
    const minis = [
      boy('1'),
      boy('2', { name: 'Nob' }),
      boy('3', { factionIds: ['warhammer-40000/space-marines'] }),
      boy('4', { status: 'built' }),
      boy('5', { parts: [{ partId: 'slugga', isSwappable: false }] }),
    ];

    const rows = toMiniRows(minis, BOXES, NAMES);

    expect(rows).toHaveLength(5);
  });

  it('keeps minis from different boxes apart', () => {
    const minis = [boy('1', { boxId: 'a' }), boy('2', { boxId: 'b' })];

    const rows = toMiniRows(minis, BOXES, NAMES);

    expect(rows.map((row) => row.box)).toEqual(['Boyz (2026)', 'Boyz (2021)']);
  });

  it('keeps minis on the workbench apart from the others', () => {
    const minis = [boy('1', { isOnWorkbench: true }), boy('2'), boy('3')];

    const rows = toMiniRows(minis, BOXES, NAMES);

    expect(
      rows.map((row) => `${row.count}× ${row.isOnWorkbench ? 'on the workbench' : 'off it'}`),
    ).toEqual(['1× on the workbench', '2× off it']);
  });
});
