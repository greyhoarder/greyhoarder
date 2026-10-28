import type { Mini } from '@greyhoarder/domain/hoard';
import { droppedParts } from './dropped-parts.js';

const boy = (partIds: readonly string[]): Mini => ({
  id: 'boy',
  name: 'Boy',
  factionIds: [],
  status: 'built',
  parts: partIds.map((partId) => ({ partId, isSwappable: false })),
  isOnWorkbench: false,
});

describe('Dropped parts', () => {
  it('drops the terms the minis no longer carry', () => {
    const before = [boy(['slugga', 'choppa'])];

    const [changed, deleted] = [droppedParts(before, [boy(['slugga'])]), droppedParts(before, [])];

    expect([changed, deleted]).toEqual([['choppa'], ['slugga', 'choppa']]);
  });
});
