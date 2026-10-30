import { factionLineage } from './faction-lineage';

const SPACE_MARINES = 'warhammer-40000/space-marines';
const DARK_ANGELS = 'warhammer-40000/dark-angels';
const CRIMSON_WOLVES = 'warhammer-40000/crimson-wolves';
const ORKS = 'warhammer-40000/orks';

const PART_OF = new Map([
  [CRIMSON_WOLVES, DARK_ANGELS],
  [DARK_ANGELS, SPACE_MARINES],
]);

describe('Faction lineage', () => {
  it('counts a faction for every faction it is part of, up the whole chain', () => {
    const lineage = factionLineage([CRIMSON_WOLVES], PART_OF);

    expect(lineage).toEqual([CRIMSON_WOLVES, DARK_ANGELS, SPACE_MARINES]);
  });

  it('counts a faction that is part of no other only for itself', () => {
    const lineage = factionLineage([ORKS], PART_OF);

    expect(lineage).toEqual([ORKS]);
  });

  it('counts a faction reached twice only once', () => {
    const lineage = factionLineage([DARK_ANGELS, SPACE_MARINES], PART_OF);

    expect(lineage).toEqual([DARK_ANGELS, SPACE_MARINES]);
  });
});
