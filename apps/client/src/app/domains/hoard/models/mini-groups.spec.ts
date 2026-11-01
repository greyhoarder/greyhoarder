import type { Mini } from '@greyhoarder/domain/hoard';
import { builtGroups } from './mini-groups';

const mini = (id: string, isSwappable: boolean): Mini => ({
  id,
  name: 'Loota',
  factionIds: ['orks'],
  status: 'built',
  parts: [{ partId: 'deffgun', isSwappable }],
  isOnWorkbench: false,
});

describe('Groups of minis', () => {
  it('puts minis with the same parts into one group, whether glued or swappable', () => {
    const groups = builtGroups([mini('glued', false), mini('swappable', true)]);

    expect(groups.map((group) => group.map(({ id }) => id))).toEqual([['glued', 'swappable']]);
  });
});
