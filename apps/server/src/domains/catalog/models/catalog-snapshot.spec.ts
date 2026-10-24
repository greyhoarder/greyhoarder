import type { CatalogKit } from '@greyhoarder/domain/catalog';
import type { CatalogFaction } from './catalog-faction.js';
import { withResolvedReferences } from './catalog-snapshot.js';
import type { GameSystem } from './game-system.js';

const WARHAMMER: GameSystem = {
  id: 'warhammer-40000',
  name: 'Warhammer 40,000',
  groups: [{ id: 'xenos', name: 'Xenos' }],
};

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

  it('keeps a faction whose group is unknown, without the group', () => {
    const orksInGroupXenoss: CatalogFaction = { ...ORKS, groupId: 'xenoss' };

    const resolved = withResolvedReferences({ systems: [WARHAMMER], factions: [orksInGroupXenoss], kits: [] });

    expect(resolved.factions).toEqual([{ ...ORKS, groupId: undefined, partOfId: undefined }]);
    expect(resolved.correctedFactions).toEqual([{ id: ORKS.id, problem: 'unknown group xenoss' }]);
  });

  it('keeps a faction whose parent faction is unknown, without the parent', () => {
    const darkAngels: CatalogFaction = {
      id: 'warhammer-40000/dark-angels',
      systemId: 'warhammer-40000',
      name: 'Dark Angels',
      partOfId: 'warhammer-40000/space-marine',
    };

    const resolved = withResolvedReferences({ systems: [WARHAMMER], factions: [darkAngels], kits: [] });

    expect(resolved.factions).toEqual([{ ...darkAngels, groupId: undefined, partOfId: undefined }]);
    expect(resolved.correctedFactions).toEqual([
      { id: darkAngels.id, problem: 'unknown partOf warhammer-40000/space-marine' },
    ]);
  });

  it('keeps a kit whose predecessor is unknown, without the predecessor', () => {
    const boyz: CatalogKit = {
      ...bundle('games-workshop/orks/boyz-2026', 'games-workshop/orks/boyz-2026'),
      contains: [],
      supersedesId: 'games-workshop/orks/boyz-2012',
    };

    const resolved = withResolvedReferences({ systems: [WARHAMMER], factions: [ORKS], kits: [boyz] });

    expect(resolved.kits).toEqual([{ ...boyz, supersedesId: undefined }]);
    expect(resolved.correctedKits).toEqual([
      { id: boyz.id, problem: 'unknown predecessor games-workshop/orks/boyz-2012' },
    ]);
  });
});
