import type { KitOption } from '../util/kit-option';

/**
 * Placeholder kits after the reference design until kits come from the
 * server; removed together with this file once the HTTP adapter exists.
 */
export const SAMPLE_KITS: readonly KitOption[] = [
  {
    id: 'games-workshop/orks/boyz-2026',
    name: 'Boyz',
    manufacturer: 'Games Workshop',
    factions: ['Orks'],
    year: 2026,
    sku: '50-80',
    barcodes: ['5011921267064'],
    isDraft: true,
    variantMinis: [11],
  },
  {
    id: 'games-workshop/orks/gorkanaut-morkanaut',
    name: 'Gorkanaut / Morkanaut',
    manufacturer: 'Games Workshop',
    factions: ['Orks'],
    barcodes: [],
    isDraft: true,
    variantMinis: [1, 1],
  },
  {
    id: 'games-workshop/space-marines/intercessors',
    name: 'Intercessors',
    manufacturer: 'Games Workshop',
    factions: ['Space Marines'],
    barcodes: [],
    isDraft: false,
    variantMinis: [10],
  },
  {
    id: 'games-workshop/orks/boyz-2021',
    name: 'Boyz',
    manufacturer: 'Games Workshop',
    factions: ['Orks'],
    year: 2021,
    sku: '50-10',
    barcodes: ['5011921156979'],
    isDraft: true,
    variantMinis: [11],
  },
  {
    id: 'games-workshop/orks/beast-snagga-boyz',
    name: 'Beast Snagga Boyz',
    manufacturer: 'Games Workshop',
    factions: ['Orks'],
    year: 2021,
    barcodes: [],
    isDraft: true,
    variantMinis: [10],
  },
  {
    id: 'games-workshop/orks/lootas-burna-boyz',
    name: 'Lootas / Burna Boyz',
    manufacturer: 'Games Workshop',
    factions: ['Orks'],
    barcodes: [],
    isDraft: true,
    variantMinis: [5, 5],
  },
  {
    id: 'games-workshop/space-marines/assault-intercessors',
    name: 'Assault Intercessors',
    manufacturer: 'Games Workshop',
    factions: ['Space Marines'],
    barcodes: [],
    isDraft: true,
    variantMinis: [10],
  },
];

/** The kits the user added boxes from most recently, newest first. */
export const RECENT_KIT_IDS: readonly string[] = [
  'games-workshop/orks/boyz-2026',
  'games-workshop/orks/gorkanaut-morkanaut',
  'games-workshop/space-marines/intercessors',
];
