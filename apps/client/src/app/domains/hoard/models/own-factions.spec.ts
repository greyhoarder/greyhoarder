import type { Mini } from '@greyhoarder/domain/hoard';
import { newFactionName, ownFactionsOf } from './own-factions';

const ORKS = 'warhammer-40000/orks';

const boy = (factionIds: readonly string[]): Mini => ({
  id: 'boy',
  name: 'Boy',
  factionIds,
  status: 'built',
  parts: [],
  isOnWorkbench: false,
});

const NAMES = new Map([
  [ORKS, 'Orks'],
  ['own/crimson-wolves', 'Crimson Wolves'],
  ['own/dropped', 'Dropped Wolves'],
]);

describe('Own factions', () => {
  it('knows only the own factions some mini carries', () => {
    const minis = [boy([ORKS, 'own/crimson-wolves'])];

    const own = ownFactionsOf(minis, NAMES);

    expect(own).toEqual([{ id: 'own/crimson-wolves', name: 'Crimson Wolves' }]);
  });

  it('offers the typed name, trimmed, for a new own faction', () => {
    const name = newFactionName('  Blood Wolves ', [{ name: 'Space Wolves' }]);

    expect(name).toBe('Blood Wolves');
  });

  it('offers no name when a faction found has it, ignoring case', () => {
    const name = newFactionName('ultramarines', [{ name: 'Ultramarines' }]);

    expect(name).toBeUndefined();
  });
});
