import type { Box, Mini } from '@greyhoarder/domain/hoard';
import { boxDeletion } from './box-deletion.js';

const BOX: Box = {
  id: 'boyz',
  name: 'Boyz (2026)',
  kit: { id: 'games-workshop/orks/boyz-2026', version: 3, name: 'Boyz (2026)', sku: '50-80' },
  factionIds: ['warhammer-40000/orks'],
  tags: [],
  addedOn: '2026-10-25',
  number: 1,
};

function mini(id: string, mini: Partial<Mini> = {}): Mini {
  return {
    id,
    name: 'Boy',
    factionIds: ['warhammer-40000/orks'],
    status: 'sprue',
    parts: [],
    sprueName: 'Boy',
    boxId: BOX.id,
    isOnWorkbench: false,
    ...mini,
  };
}

describe('Box deletion', () => {
  it('deletes the minis on the sprue with the box, gone ones included', () => {
    const minis = [
      mini('on-sprue'),
      mini('lost-on-sprue', { departure: { reason: 'lost', on: '2026-10-26' } }),
      mini('built', { status: 'built' }),
    ];

    const { deleted } = boxDeletion(BOX, minis, { keepBuiltMinis: true });

    expect(deleted.map((deletedMini) => deletedMini.id)).toEqual(['on-sprue', 'lost-on-sprue']);
  });

  it("keeps the minis past the sprue without a box, with the box's kit", () => {
    const minis = [mini('on-sprue'), mini('painted', { status: 'painted' })];

    const { kept } = boxDeletion(BOX, minis, { keepBuiltMinis: true });

    expect(kept).toEqual([
      {
        id: 'painted',
        name: 'Boy',
        factionIds: ['warhammer-40000/orks'],
        status: 'painted',
        parts: [],
        sprueName: 'Boy',
        kit: BOX.kit,
        isOnWorkbench: false,
      },
    ]);
  });
});
