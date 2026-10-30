import type { OwnFaction } from '@greyhoarder/domain/hoard';
import { resolveFactions } from './faction-changes.js';

const CRIMSON_WOLVES: OwnFaction = { id: 'own/crimson-wolves', name: 'Crimson Wolves' };

describe('Faction changes', () => {
  it('refers to one new own faction however often its name is given', () => {
    const { factionIds, newFactions } = resolveFactions(
      [],
      [{ name: 'Blood Wolves' }, { name: 'blood wolves' }],
      () => 'new',
    );

    expect(newFactions).toEqual([{ id: 'own/new', name: 'Blood Wolves' }]);
    expect(factionIds).toEqual(['own/new']);
  });

  it('refers to the own faction the user already has of a name', () => {
    const { factionIds, newFactions } = resolveFactions([CRIMSON_WOLVES], [{ name: 'crimson wolves' }], () => 'new');

    expect(factionIds).toEqual(['own/crimson-wolves']);
    expect(newFactions).toEqual([]);
  });
});
