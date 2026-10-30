import type { HobbyStatus } from '@greyhoarder/domain/hoard';
import { factionProgresses } from './faction-progress';

const ORKS = 'warhammer-40000/orks';
const FREEBOOTERZ = 'warhammer-40000/freebooterz';

function mini(status: HobbyStatus, ...factionIds: string[]) {
  return { status, factionIds };
}

describe('Faction progress', () => {
  it('counts a mini under each of its factions', () => {
    const progresses = factionProgresses([mini('sprue', ORKS, FREEBOOTERZ)]);

    expect(progresses.map(({ factionId, miniCount }) => ({ factionId, miniCount }))).toEqual([
      { factionId: ORKS, miniCount: 1 },
      { factionId: FREEBOOTERZ, miniCount: 1 },
    ]);
  });

  it('counts a mini also under every faction its factions are part of', () => {
    const spaceMarines = 'warhammer-40000/space-marines';
    const darkAngels = 'warhammer-40000/dark-angels';
    const minis = [...Array<string>(4).fill(spaceMarines), ...Array<string>(2).fill(darkAngels)].map((factionId) =>
      mini('built', factionId),
    );

    const progresses = factionProgresses(minis, new Map([[darkAngels, spaceMarines]]));

    expect(progresses.map(({ factionId, miniCount }) => ({ factionId, miniCount }))).toEqual([
      { factionId: spaceMarines, miniCount: 6 },
      { factionId: darkAngels, miniCount: 2 },
    ]);
  });

  it('puts minis without a faction into a group of their own', () => {
    const progresses = factionProgresses([mini('sprue'), mini('built', ORKS), mini('primed')]);

    expect(progresses.map(({ factionId, miniCount }) => ({ factionId, miniCount }))).toEqual([
      { factionId: ORKS, miniCount: 1 },
      { factionId: undefined, miniCount: 2 },
    ]);
  });

  it('counts painted and done minis as painted', () => {
    const [orks] = factionProgresses([mini('primed', ORKS), mini('painted', ORKS), mini('done', ORKS)]);

    expect(orks?.paintedCount).toBe(2);
  });

  it('counts the minis of each status', () => {
    const [orks] = factionProgresses([
      mini('sprue', ORKS),
      mini('sprue', ORKS),
      mini('built', ORKS),
      mini('painted', ORKS),
      mini('done', ORKS),
    ]);

    expect(orks?.statusCounts).toEqual({ sprue: 2, built: 1, primed: 0, painted: 1, done: 1 });
  });
});
