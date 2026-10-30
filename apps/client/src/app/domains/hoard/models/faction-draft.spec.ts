import { type FactionDraft, hasFaction, isOwnDraft } from './faction-draft';

const CHOSEN: FactionDraft[] = [{ id: 'warhammer-40000/orks', name: 'Orks' }, { name: 'Crimson Wolves' }];

describe('Faction draft', () => {
  it('knows a chosen faction by its id', () => {
    const isChosen = hasFaction(CHOSEN, { id: 'warhammer-40000/orks', name: 'Orks' });

    expect(isChosen).toBe(true);
  });

  it('knows a new own faction among those chosen by its name, ignoring case', () => {
    const isChosen = hasFaction(CHOSEN, { name: 'crimson wolves' });

    expect(isChosen).toBe(true);
  });

  it("counts a new faction, which has no id yet, as one of the user's own", () => {
    const own = [{ name: 'Crimson Wolves' }, { id: 'warhammer-40000/orks', name: 'Orks' }].map(isOwnDraft);

    expect(own).toEqual([true, false]);
  });
});
