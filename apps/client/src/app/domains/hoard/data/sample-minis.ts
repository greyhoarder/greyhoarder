import type { HobbyStatus } from '../models/hobby-status';
import type { Mini } from '../models/mini';

const ORKS = 'warhammer-40000/orks';
const SPACE_MARINES = 'warhammer-40000/space-marines';
const DARK_ANGELS = 'warhammer-40000/dark-angels';
const CRIMSON_WOLVES = 'own/crimson-wolves';

/** Alike sample minis, each `count` times. */
interface SampleMinis {
  readonly count: number;
  readonly name: string;
  readonly factionIds: readonly string[];
  readonly boxId?: string;
  readonly parts?: readonly string[];
  readonly status: HobbyStatus;
  readonly isOnWorkbench?: boolean;
}

const SAMPLES: readonly SampleMinis[] = [
  { count: 7, name: 'Boy', factionIds: [ORKS], boxId: '1', status: 'sprue' },
  { count: 2, name: 'Boy', factionIds: [ORKS], boxId: '1', parts: ['Slugga', 'Choppa'], status: 'built' },
  { count: 1, name: 'Nob', factionIds: [ORKS], boxId: '1', parts: ['Power Klaw'], status: 'built', isOnWorkbench: true },
  { count: 1, name: 'Ammo Runt', factionIds: [ORKS], boxId: '1', status: 'sprue' },
  { count: 3, name: 'Boy', factionIds: [ORKS], boxId: '6', parts: ['Shoota'], status: 'painted' },
  { count: 1, name: 'Gorkanaut', factionIds: [ORKS], boxId: '5', status: 'primed', isOnWorkbench: true },
  { count: 9, name: 'Beast Snagga Boy', factionIds: [ORKS], boxId: '3', status: 'sprue' },
  { count: 1, name: 'Beast Snagga Nob', factionIds: [ORKS], boxId: '3', status: 'sprue' },
  { count: 10, name: 'Intercessor', factionIds: [SPACE_MARINES], boxId: '2', status: 'sprue' },
  {
    count: 4,
    name: 'Intercessor',
    factionIds: [DARK_ANGELS],
    boxId: '4',
    parts: ['Bolt Rifle'],
    status: 'primed',
    isOnWorkbench: true,
  },
  {
    count: 1,
    name: 'Intercessor Sergeant',
    factionIds: [DARK_ANGELS],
    boxId: '4',
    parts: ['Bolt Rifle', 'Power Sword'],
    status: 'primed',
    isOnWorkbench: true,
  },
  { count: 5, name: 'Intercessor', factionIds: [CRIMSON_WOLVES], boxId: '4', parts: ['Auto Bolt Rifle'], status: 'done' },
  { count: 1, name: 'Captain', factionIds: [CRIMSON_WOLVES], parts: ['Master-crafted Bolt Rifle'], status: 'painted' },
];

/**
 * Placeholder minis after the reference design until the hoard comes from the
 * server; removed together with this file once the HTTP adapter exists.
 */
export const SAMPLE_MINIS: readonly Mini[] = SAMPLES.flatMap((sample, sampleIndex) =>
  Array.from({ length: sample.count }, (_, index) => ({
    id: `${sampleIndex + 1}-${index + 1}`,
    name: sample.name,
    factionIds: sample.factionIds,
    status: sample.status,
    parts: sample.parts ?? [],
    boxId: sample.boxId,
    isOnWorkbench: sample.isOnWorkbench ?? false,
  })),
);
