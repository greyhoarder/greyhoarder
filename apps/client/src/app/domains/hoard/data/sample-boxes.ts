import type { Box } from '../models/box';

/**
 * Placeholder boxes after the reference design until the hoard comes from the
 * server; removed together with this file once the HTTP adapter exists.
 */
export const SAMPLE_BOXES: readonly Box[] = [
  {
    id: '1',
    name: 'Boyz (2026)',
    kit: { id: 'games-workshop/orks/boyz-2026', version: 1, name: 'Boyz (2026)', sku: '50-80' },
    factionIds: ['warhammer-40000/orks'],
    tags: [],
    addedOn: '2026-10-12',
  },
  {
    id: '2',
    name: 'Intercessors',
    kit: { id: 'games-workshop/space-marines/intercessors-2017', version: 1, name: 'Intercessors' },
    factionIds: ['warhammer-40000/space-marines'],
    tags: [],
    addedOn: '2026-09-30',
  },
  {
    id: '3',
    name: 'Beast Snagga Boyz',
    kit: { id: 'games-workshop/orks/beast-snagga-boyz-2021', version: 1, name: 'Beast Snagga Boyz' },
    factionIds: ['warhammer-40000/orks'],
    tags: ['Shelf of shame'],
    addedOn: '2026-08-03',
  },
  {
    id: '4',
    name: 'Intercessors',
    kit: { id: 'games-workshop/space-marines/intercessors-2017', version: 1, name: 'Intercessors' },
    factionIds: ['warhammer-40000/dark-angels', 'own/crimson-wolves'],
    tags: ['Second hand'],
    addedOn: '2026-01-14',
  },
  {
    id: '5',
    name: 'Gorkanaut / Morkanaut',
    kit: { id: 'games-workshop/orks/gorkanaut-2014', version: 1, name: 'Gorkanaut / Morkanaut' },
    factionIds: ['warhammer-40000/orks'],
    tags: ['Gift', 'Christmas 2025'],
    addedOn: '2025-12-24',
  },
  {
    id: '6',
    name: 'Boyz (2021)',
    kit: { id: 'games-workshop/orks/boyz-2021', version: 1, name: 'Boyz (2021)', sku: '50-57' },
    factionIds: ['warhammer-40000/orks'],
    tags: ['Second hand'],
    addedOn: '2024-03-02',
  },
];

/** The names of the factions the sample boxes and minis refer to. */
export const SAMPLE_FACTION_NAMES: ReadonlyMap<string, string> = new Map([
  ['warhammer-40000/orks', 'Orks'],
  ['warhammer-40000/space-marines', 'Space Marines'],
  ['warhammer-40000/dark-angels', 'Dark Angels'],
  ['own/crimson-wolves', 'Crimson Wolves'],
]);
