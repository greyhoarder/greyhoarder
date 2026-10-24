import type { CatalogKit } from '@greyhoarder/domain/catalog';
import { toKit } from './kit';

function catalogKit(kit: Partial<CatalogKit> & Pick<CatalogKit, 'id' | 'name'>): CatalogKit {
  return {
    manufacturer: 'games-workshop',
    factionIds: ['warhammer-40000/orks'],
    releases: [],
    minis: 10,
    isDraft: false,
    contains: [],
    variants: [],
    ...kit,
  };
}

describe('Kit', () => {
  it('names an either-or kit by every variant, each once', () => {
    const lootas = catalogKit({
      id: 'games-workshop/orks/lootas-2008',
      name: 'Lootas',
      variants: [
        { name: 'Lootas', slots: [] },
        { name: 'Burna Boyz', slots: [] },
      ],
    });

    const kit = toKit(lootas, new Map());

    expect(kit.names).toEqual(['Lootas', 'Burna Boyz']);
  });

  it('dates a kit by its oldest release', () => {
    const boyz = catalogKit({
      id: 'games-workshop/orks/boyz-2008',
      name: 'Boyz',
      releases: [{ year: 2014 }, { year: 2008 }],
    });

    const kit = toKit(boyz, new Map());

    expect(kit.year).toBe(2008);
  });

  it('leaves out bundled kits the catalog does not know', () => {
    const boyz = catalogKit({ id: 'games-workshop/orks/boyz-2021', name: 'Boyz' });
    const battleforce = catalogKit({
      id: 'games-workshop/orks/battleforce-2024',
      name: 'Battleforce',
      contains: [
        { kitId: boyz.id, count: 1 },
        { kitId: 'games-workshop/orks/unknown', count: 1 },
      ],
    });

    const kit = toKit(battleforce, new Map([[boyz.id, boyz]]));

    expect(kit.contains.map((bundled) => bundled.kit.id)).toEqual([boyz.id]);
  });
});
