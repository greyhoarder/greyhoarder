import type { Kit } from '@greyhoarder/domain/hoard';
import { armiesText, armySections, kitSections } from './army-sections';

const ORKS = 'warhammer-40000/orks';
const MARINES = 'warhammer-40000/space-marines';
const NAMES = new Map([
  [ORKS, 'Orks'],
  [MARINES, 'Space Marines'],
]);

const kit = (factionIds: string[], slotFactionIds: string[][]): Kit => ({
  id: 'games-workshop/sets/starter',
  version: 1,
  name: 'Starter',
  names: ['Starter'],
  manufacturer: 'games-workshop',
  factionIds,
  isDraft: false,
  variants: [
    {
      name: 'Starter',
      slots: slotFactionIds.map((ids) => ({ count: 1, names: ['Mini'], parts: [], factionIds: ids })),
      minis: slotFactionIds.length,
    },
  ],
  minis: slotFactionIds.length,
  contains: [],
});

describe('Armies of a box or kit', () => {
  it('lists the armies in the order of the kit, others by name and minis without a faction last', () => {
    const items = [undefined, 'Tau', 'Orks', 'Eldar', 'Space Marines'];

    const sections = armySections(items, (army) => army, ['Space Marines', 'Orks']);

    expect(sections.map((section) => section.army)).toEqual(['Space Marines', 'Orks', 'Eldar', 'Tau', 'No faction']);
  });

  it('counts a row without a faction of its own to the first faction of the kit', () => {
    const sections = kitSections(kit([MARINES, ORKS], [[], [ORKS]]), NAMES);

    expect(sections.map((section) => [section.army, section.items.length])).toEqual([
      ['Space Marines', 1],
      ['Orks', 1],
    ]);
  });

  it('keeps the rows of a kit of one army together', () => {
    const sections = kitSections(kit([ORKS], [[], []]), NAMES);

    expect(sections).toHaveLength(1);
  });

  it('joins two armies with "and" and three with commas before it', () => {
    expect(armiesText(['Orks', 'Tau'])).toBe('Orks and Tau');
    expect(armiesText(['Orks', 'Tau', 'Eldar'])).toBe('Orks, Tau and Eldar');
  });
});
