import { findOwnFaction, isOwnFaction, type OwnFaction, ownFactionId } from './own-faction.js';

const CRIMSON_WOLVES: OwnFaction = { id: 'own/crimson-wolves', name: 'Crimson Wolves' };

describe('Own faction', () => {
  it('finds an own faction by its name, ignoring case and surrounding spaces', () => {
    const faction = findOwnFaction([CRIMSON_WOLVES], '  crimson WOLVES ');

    expect(faction).toBe(CRIMSON_WOLVES);
  });

  it('tells an own faction from one of the catalog by its id', () => {
    const ids = [ownFactionId('3f2a'), 'warhammer-40000/orks'];

    const own = ids.map(isOwnFaction);

    expect(own).toEqual([true, false]);
  });
});
