import type { Mini } from '@greyhoarder/domain/hoard';
import { emptiedBoxIds, withoutDeletedRecipients } from './mini-deletion.js';

const mini = (id: string, overrides: Partial<Mini> = {}): Mini => ({
  id,
  name: 'Boy',
  factionIds: [],
  status: 'built',
  parts: [],
  isOnWorkbench: false,
  ...overrides,
});

const stripped = (id: string, recipientMiniIds: readonly string[]): Mini =>
  mini(id, { departure: { reason: 'stripped', on: '2026-10-20', recipientMiniIds } });

describe('Mini deletion', () => {
  it('takes deleted minis out of the recipients of others', () => {
    const donor = stripped('donor', ['nob', 'boss']);

    const changed = withoutDeletedRecipients([donor], new Set(['nob']));

    expect(changed.map((mini) => mini.departure?.recipientMiniIds)).toEqual([['boss']]);
  });

  it('leaves minis alone that named no deleted recipient', () => {
    const staying = [stripped('donor', ['boss']), mini('boy')];

    const changed = withoutDeletedRecipients(staying, new Set(['nob']));

    expect(changed).toEqual([]);
  });

  it('names the boxes left without any minis', () => {
    const deleted = [mini('boy', { boxId: 'boyz' }), mini('nob', { boxId: 'nobz' })];
    const staying = [mini('other-nob', { boxId: 'nobz' })];

    const emptied = emptiedBoxIds(deleted, staying);

    expect(emptied).toEqual(['boyz']);
  });

  it('does not call a box empty while it keeps a gone mini', () => {
    const deleted = [mini('boy', { boxId: 'boyz' })];
    const staying = [mini('sold-boy', { boxId: 'boyz', departure: { reason: 'sold', on: '2026-10-20' } })];

    const emptied = emptiedBoxIds(deleted, staying);

    expect(emptied).toEqual([]);
  });
});
