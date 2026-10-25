import type { Kit, Part } from '@greyhoarder/domain/hoard';
import { partOptions, RANGE_LIMIT } from './part-options';

const POWER_KLAW: Part = { id: 'power-klaw', name: 'Power Klaw', aliases: ['Power Claw'] };
const VOCABULARY: Part[] = [
  { id: 'trophy-rack', name: 'Trophy Rack', aliases: [] },
  { id: 'deffgun', name: 'Deffgun', aliases: [] },
  POWER_KLAW,
];

/** A kit whose Loota slot offers Deffgun and whose Spanner slot offers Big Shoota. */
const KIT: Kit = {
  id: 'games-workshop/orks/lootas-2008',
  version: 1,
  name: 'Lootas',
  names: ['Lootas'],
  manufacturer: 'games-workshop',
  factionIds: [],
  isDraft: false,
  variants: [
    {
      name: 'Lootas',
      slots: [
        { count: 4, names: ['Loota'], parts: ['Deffgun'], factionIds: [] },
        { count: 1, names: ['Spanner'], parts: ['Big Shoota'], factionIds: [] },
      ],
      minis: 5,
    },
  ],
  minis: 5,
  contains: [],
};

const optionsFor = (filter: string, carried: readonly string[] = [], range: readonly string[] = []) =>
  partOptions({ kit: KIT, sprueName: 'Loota', vocabulary: VOCABULARY, range, carried }, filter);

const names = (options: readonly { readonly name: string }[]) => options.map((option) => option.name);

describe('Part options', () => {
  it("offers the parts the kit gives the minis' slot first, then the rest of the vocabulary by name", () => {
    const options = optionsFor('');

    expect([names(options.fromKit), names(options.fromVocabulary)]).toEqual([
      ['Deffgun'],
      ['Power Klaw', 'Trophy Rack'],
    ]);
  });

  it('leaves out the parts the minis already carry', () => {
    const options = optionsFor('', ['Deffgun', 'Power Klaw']);

    expect([names(options.fromKit), names(options.fromVocabulary)]).toEqual([[], ['Trophy Rack']]);
  });

  it('names the alias a part matched through', () => {
    const options = optionsFor('claw');

    expect(options.fromVocabulary).toEqual([{ name: 'Power Klaw', partId: 'power-klaw', alias: 'Power Claw' }]);
  });

  it('offers parts of the range only while filtering, at most 20', () => {
    const range = Array.from({ length: 30 }, (_, index) => `Grot ${index}`);

    const [unfiltered, filtered] = [optionsFor('', [], range), optionsFor('grot', [], range)];

    expect([unfiltered.fromRange.length, filtered.fromRange.length]).toEqual([0, RANGE_LIMIT]);
  });

  it('offers to create a part only when the filter names no part exactly', () => {
    const [newPart, alias] = [optionsFor('Grot Banner'), optionsFor('power claw')];

    expect([newPart.create, alias.create]).toEqual(['Grot Banner', undefined]);
  });
});
