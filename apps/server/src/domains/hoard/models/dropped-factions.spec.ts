import type { Mini } from '@greyhoarder/domain/hoard';
import { droppedFactions } from './dropped-factions.js';

const boy = (factionIds: readonly string[]): Mini => ({
  id: 'boy',
  name: 'Boy',
  factionIds,
  status: 'built',
  parts: [],
  isOnWorkbench: false,
});

describe('Dropped factions', () => {
  it('names the own factions the minis no longer carry', () => {
    const before = [boy(['warhammer-40000/orks', 'own/crimson-wolves'])];

    const dropped = droppedFactions(before, [boy(['warhammer-40000/orks'])]);

    expect(dropped).toEqual(['own/crimson-wolves']);
  });

  it('never names a faction of the catalog', () => {
    const before = [boy(['warhammer-40000/orks'])];

    const dropped = droppedFactions(before, [boy([])]);

    expect(dropped).toEqual([]);
  });
});
