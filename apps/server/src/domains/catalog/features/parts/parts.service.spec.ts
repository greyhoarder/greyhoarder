import type { CatalogFaction } from '../../models/catalog-faction.js';
import type { CatalogKitQueries } from '../../ports/catalog-kit-queries.js';
import { PartsService } from './parts.service.js';

const SPACE_MARINES: CatalogFaction = { id: 'w40k/space-marines', systemId: 'w40k', name: 'Space Marines' };
const DARK_ANGELS: CatalogFaction = {
  id: 'w40k/dark-angels',
  systemId: 'w40k',
  name: 'Dark Angels',
  partOfId: SPACE_MARINES.id,
};

/** A catalog whose kits offer these parts per faction. */
function fakeCatalog(partsOf: Readonly<Record<string, readonly string[]>>): CatalogKitQueries {
  const factions = [SPACE_MARINES, DARK_ANGELS];
  return {
    searchKits: () => Promise.resolve([]),
    findKits: () => Promise.resolve([]),
    findKitVersion: () => Promise.resolve(undefined),
    findFactions: (ids) => Promise.resolve(factions.filter((faction) => ids.includes(faction.id))),
    findKitParts: (ids) => Promise.resolve([...new Set(ids.flatMap((id) => partsOf[id] ?? []))]),
    findFactionNames: () => Promise.resolve(new Map()),
    findSystemNames: () => Promise.resolve(new Map()),
  };
}

describe('Range parts', () => {
  it('offers the parts of the kits of a faction and of every faction it is part of', async () => {
    const service = new PartsService(
      fakeCatalog({ [DARK_ANGELS.id]: ['Corvus Hood'], [SPACE_MARINES.id]: ['Bolt Rifle'] }),
    );

    const parts = await service.rangeParts([DARK_ANGELS.id]);

    expect(parts).toEqual(['Bolt Rifle', 'Corvus Hood']);
  });

  it('lists the parts by name', async () => {
    const service = new PartsService(fakeCatalog({ [SPACE_MARINES.id]: ['Power Sword', 'Bolt Rifle', 'Chainsword'] }));

    const parts = await service.rangeParts([SPACE_MARINES.id]);

    expect(parts).toEqual(['Bolt Rifle', 'Chainsword', 'Power Sword']);
  });
});
