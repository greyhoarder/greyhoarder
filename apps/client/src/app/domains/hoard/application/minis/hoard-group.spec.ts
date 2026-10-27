import type { MiniRow } from './mini-row';
import { toHoardGroups } from './hoard-group';

const row = (id: string, overrides: Partial<MiniRow> = {}): MiniRow => ({
  id,
  groupId: 'boy-slugga',
  name: 'Boy',
  factions: ['Orks'],
  box: 'Boyz (2026)',
  parts: ['Slugga'],
  status: 'built',
  isOnWorkbench: false,
  count: 1,
  ...overrides,
});

describe('Groups of the Minis tab', () => {
  it('puts minis with the same name, factions and parts into one group, whatever their box, status or workbench place', () => {
    const rows = [
      row('m1', { status: 'primed' }),
      row('m2', { box: 'Boyz (2021)', isOnWorkbench: true }),
    ];

    const groups = toHoardGroups(rows);

    expect(groups.map((group) => group.rows.map((each) => each.id))).toEqual([['m1', 'm2']]);
  });

  it('puts a mini with other parts into a group of its own', () => {
    const rows = [row('m1'), row('m2', { groupId: 'boy-choppa', parts: ['Choppa'] })];

    const groups = toHoardGroups(rows);

    expect(groups).toHaveLength(2);
  });

  it('lists the minis of a group from the furthest status back, then by box', () => {
    const rows = [
      row('built', { status: 'built' }),
      row('done', { status: 'done' }),
      row('painted-2021', { status: 'painted', box: 'Boyz (2021)' }),
      row('painted-2026', { status: 'painted', box: 'Boyz (2026)' }),
    ];

    const [group] = toHoardGroups(rows);

    expect(group?.rows.map((each) => each.id)).toEqual([
      'done',
      'painted-2021',
      'painted-2026',
      'built',
    ]);
  });

  it('counts minis from two boxes with the same name as from two boxes', () => {
    const rows = [
      row('m1', { boxId: 'b1', boxNumber: 1 }),
      row('m2', { boxId: 'b2', boxNumber: 2 }),
    ];

    const [group] = toHoardGroups(rows);

    expect(group?.boxes).toEqual(['Boyz (2026) #1', 'Boyz (2026) #2']);
  });
});
