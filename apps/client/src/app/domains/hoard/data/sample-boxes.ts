import type { BoxRow } from '../util/box-row';

/**
 * Placeholder boxes after the reference design until the hoard comes from the
 * server; removed together with this file once the HTTP adapter exists.
 */
export const SAMPLE_BOXES: readonly BoxRow[] = [
  {
    id: '1',
    name: 'Boyz (2026)',
    kit: { name: 'Boyz (2026)', sku: '50-80' },
    factions: ['Orks'],
    minis: { sprue: 7, built: 3 },
    addedOn: '2026-10-12',
    price: { amount: 49.5, currency: 'EUR' },
    tags: [],
  },
  {
    id: '2',
    name: 'Intercessors',
    kit: { name: 'Intercessors' },
    factions: ['Space Marines'],
    minis: { sprue: 10 },
    addedOn: '2026-09-30',
    price: { amount: 60, currency: 'EUR' },
    tags: [],
  },
  {
    id: '3',
    name: 'Beast Snagga Boyz',
    kit: { name: 'Beast Snagga Boyz' },
    factions: ['Orks'],
    minis: { sprue: 9 },
    addedOn: '2026-08-03',
    price: { amount: 45, currency: 'EUR' },
    tags: ['Shelf of shame'],
  },
  {
    id: '4',
    name: 'Intercessors',
    kit: { name: 'Intercessors' },
    factions: ['Dark Angels', 'Crimson Wolves'],
    minis: { primed: 5, done: 5 },
    addedOn: '2026-01-14',
    price: { amount: 55, currency: 'EUR' },
    tags: ['Second hand'],
  },
  {
    id: '5',
    name: 'Gorkanaut / Morkanaut',
    kit: { name: 'Gorkanaut / Morkanaut' },
    factions: ['Orks'],
    minis: { primed: 1 },
    addedOn: '2025-12-24',
    price: { amount: 115, currency: 'EUR' },
    tags: ['Gift', 'Christmas 2025'],
  },
  {
    id: '6',
    name: 'Boyz (2021)',
    kit: { name: 'Boyz (2021)', sku: '50-57' },
    factions: ['Orks'],
    minis: { painted: 3 },
    addedOn: '2024-03-02',
    tags: ['Second hand'],
  },
];
