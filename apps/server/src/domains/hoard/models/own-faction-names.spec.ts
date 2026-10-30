import type { Mini, OwnFaction } from '@greyhoarder/domain/hoard';
import { ownFactionNamesOf } from './own-faction-names.js';

const OWN: OwnFaction[] = [
  { id: 'own/crimson-wolves', name: 'Crimson Wolves' },
  { id: 'own/blood-wolves', name: 'Blood Wolves' },
];

const BOY: Mini = {
  id: 'boy',
  name: 'Boy',
  factionIds: ['warhammer-40000/orks', 'own/crimson-wolves'],
  status: 'built',
  parts: [],
  isOnWorkbench: false,
};

describe('Own faction names', () => {
  it('names only the own factions the minis carry', () => {
    const names = ownFactionNamesOf([BOY], OWN);

    expect(names).toEqual(new Map([['own/crimson-wolves', 'Crimson Wolves']]));
  });
});
