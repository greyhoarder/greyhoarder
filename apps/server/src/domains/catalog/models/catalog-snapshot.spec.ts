import type { CatalogKit } from '@greyhoarder/domain/catalog';
import type { CatalogFaction } from './catalog-faction.js';
import { withResolvedReferences } from './catalog-snapshot.js';
import type { GameSystem } from './game-system.js';

const WARHAMMER: GameSystem = { id: 'warhammer-40000', name: 'Warhammer 40,000', groups: [] };

const ORKS: CatalogFaction = { id: 'warhammer-40000/orks', systemId: 'warhammer-40000', name: 'Orks' };

function bundle(id: string, containedId: string): CatalogKit {
  return {
    id,
    manufacturer: 'games-workshop',
    name: id,
    factionIds: [ORKS.id],
    releases: [],
    minis: 10,
    isDraft: false,
    contains: [{ kitId: containedId, count: 1 }],
    variants: [],
  };
}

const A = bundle('games-workshop/orks/a', 'games-workshop/orks/b');
const B = bundle('games-workshop/orks/b', 'games-workshop/orks/a');

describe('Catalog snapshot', () => {
  it('leaves out kits that contain themselves, also through other kits', () => {
    const resolved = withResolvedReferences({ systems: [WARHAMMER], factions: [ORKS], kits: [A, B] });

    expect(resolved.kits).toEqual([]);
    expect(resolved.leftOutKits).toEqual([
      { id: A.id, problem: 'contains itself' },
      { id: B.id, problem: 'contains itself' },
    ]);
  });
});
