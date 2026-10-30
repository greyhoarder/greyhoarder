import { matchingOwnFactions } from './faction-search';

describe('Faction search', () => {
  it('finds an own faction by part of its name, ignoring case', () => {
    const own = [{ id: 'own/crimson-wolves', name: 'Crimson Wolves' }];

    const found = matchingOwnFactions(own, 'WOL');

    expect(found).toEqual([{ id: 'own/crimson-wolves', name: 'Crimson Wolves' }]);
  });
});
