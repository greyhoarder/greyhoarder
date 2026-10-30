import type { Box, Kit } from '@greyhoarder/domain/hoard';
import { isFromKit } from './box';

const BOYZ_2026: Kit = {
  id: 'games-workshop/orks/boyz-2026',
  version: 2,
  name: 'Boyz',
  names: ['Boyz'],
  manufacturer: 'games-workshop',
  factionIds: ['warhammer-40000/orks'],
  isDraft: false,
  variants: [],
  minis: 10,
  contains: [],
};

function box(kit?: Box['kit']): Box {
  return { id: '1', name: 'Boyz', kit, factionIds: [], tags: [], addedOn: '2026-10-24', number: 1 };
}

describe('Box', () => {
  it('counts a box as one of the kit it was added from, whichever version', () => {
    const fromFirstVersion = box({ id: BOYZ_2026.id, version: 1, name: 'Boyz (2026)' });

    const isCounted = isFromKit(fromFirstVersion, BOYZ_2026);

    expect(isCounted).toBe(true);
  });

  it('does not count a box from another kit or without a kit', () => {
    const boxes = [box({ id: 'games-workshop/orks/boyz-2021', version: 1, name: 'Boyz (2021)' }), box()];

    const counted = boxes.map((other) => isFromKit(other, BOYZ_2026));

    expect(counted).toEqual([false, false]);
  });
});
