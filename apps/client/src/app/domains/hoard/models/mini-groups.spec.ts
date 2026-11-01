import type { Mini } from '@greyhoarder/domain/hoard';
import { builtGroups } from './mini-groups';

const mini = (id: string, isSwappable: boolean, partIds = ['deffgun']): Mini => ({
  id,
  name: 'Loota',
  factionIds: ['orks'],
  status: 'built',
  parts: partIds.map((partId) => ({ partId, isSwappable })),
  isOnWorkbench: false,
});

describe('Groups of minis', () => {
  it('puts minis with the same parts in another order into one group', () => {
    const groups = builtGroups([
      mini('first', false, ['deffgun', 'choppa']),
      mini('second', false, ['choppa', 'deffgun']),
    ]);

    expect(groups).toHaveLength(1);
  });

  it('puts minis with the same parts into one group, whether glued or swappable', () => {
    const groups = builtGroups([mini('glued', false), mini('swappable', true)]);

    expect(groups.map((group) => group.map(({ id }) => id))).toEqual([['glued', 'swappable']]);
  });
});
