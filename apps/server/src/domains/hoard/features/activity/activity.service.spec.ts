import type { Box, Mini, MiniStep } from '@greyhoarder/domain/hoard';
import type { CatalogKitQueries } from '../../../catalog/api/index.js';
import type { HoardRepository } from '../../ports/hoard-repository.js';
import { ActivityService } from './activity.service.js';

const ORKS = 'warhammer-40000/orks';
const NECRONS = 'warhammer-40000/necrons';

const mini = (id: string, factionIds: string[], boxId?: string): Mini => ({
  id,
  name: 'Boy',
  factionIds,
  status: 'painted',
  parts: [],
  ...(boxId === undefined ? {} : { boxId }),
  isOnWorkbench: false,
});

const box: Box = { id: 'b1', name: 'Boyz', factionIds: [], tags: [], addedOn: '2026-11-01', number: 1 };

function service(steps: readonly MiniStep[], minis: readonly Mini[], boxes: readonly Box[] = []) {
  const findSteps = vi.fn<HoardRepository['findSteps']>(() => Promise.resolve([...steps]));

  const hoard: HoardRepository = {
    findSteps,
    findBoxes: vi.fn(() => Promise.resolve([...boxes])),
    findMinis: vi.fn(() => Promise.resolve([...minis])),
    findMinisByIds: vi.fn(),
    findParts: vi.fn(),
    findOwnFactions: vi.fn(() => Promise.resolve([])),
    updateMinis: vi.fn(),
    deleteMinis: vi.fn(),
    deleteHoard: vi.fn(),
    deleteBoxes: vi.fn(),
    addMinis: vi.fn(),
    addBoxes: vi.fn(),
  };

  const catalog: CatalogKitQueries = {
    searchKits: vi.fn(),
    findKits: vi.fn(),
    findKitVersion: vi.fn(),
    findFactions: vi.fn(),
    findKitParts: vi.fn(),
    findFactionNames: vi.fn(() =>
      Promise.resolve(
        new Map([
          [ORKS, 'Orks'],
          [NECRONS, 'Necrons'],
        ]),
      ),
    ),
    findSystemNames: vi.fn(),
  };

  return { activity: new ActivityService(hoard, catalog), findSteps };
}

describe('Activity service', () => {
  it('counts the steps per day of the last year, only of the owner', async () => {
    const { activity, findSteps } = service(
      [
        { miniId: 'm1', status: 'painted', on: '2026-11-02' },
        { miniId: 'm2', status: 'primed', on: '2026-11-02' },
        { miniId: 'm1', status: 'built', on: '2024-01-01' },
      ],
      [mini('m1', [ORKS]), mini('m2', [ORKS])],
    );

    const { days } = await activity.overview('owner', '2026-11-02');

    expect(findSteps).toHaveBeenCalledWith('owner');
    expect(days).toEqual([{ date: '2026-11-02', steps: 2 }]);
  });

  it('lists a month with a line per status and per added boxes', async () => {
    const { activity } = service(
      [
        { miniId: 'm1', status: 'painted', on: '2026-11-02' },
        { miniId: 'm2', status: 'primed', on: '2026-11-01' },
      ],
      [mini('m1', [ORKS], 'b1'), mini('m2', [ORKS], 'b1')],
      [box],
    );

    const { months } = await activity.overview('owner', '2026-11-02');

    expect(months.map((month) => month.month)).toEqual(['2026-11']);
    expect(months[0]?.entries.map(({ kind, count, minis }) => [kind, count, minis])).toEqual([
      ['painted', 1, 1],
      ['primed', 1, 1],
      ['box', 1, 2],
    ]);
  });

  it('names one faction, or how many when there are several', async () => {
    const { activity } = service(
      [
        { miniId: 'm1', status: 'painted', on: '2026-11-02' },
        { miniId: 'm2', status: 'painted', on: '2026-11-02' },
        { miniId: 'm3', status: 'done', on: '2026-11-02' },
      ],
      [mini('m1', [ORKS]), mini('m2', [NECRONS]), mini('m3', [ORKS])],
    );

    const { months } = await activity.overview('owner', '2026-11-02');

    expect(months[0]?.entries.map((entry) => entry.factions)).toEqual([['Orks'], ['Orks', 'Necrons']]);
  });
});
