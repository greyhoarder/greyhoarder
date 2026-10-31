import type { Mini } from '@greyhoarder/domain/hoard';
import { changesSummary, factionShares, mixedStatus, partShares, workbenchRefusals } from './selected-minis';

const ORKS = 'warhammer-40000/orks';
const BLOOD_AXES = 'own-blood-axes';

const mini = (id: string, overrides: Partial<Mini> = {}): Mini => ({
  id,
  name: 'Boy',
  factionIds: [ORKS],
  status: 'built',
  parts: [],
  boxId: 'b1',
  isOnWorkbench: false,
  ...overrides,
});

describe('Selected minis', () => {
  it('names how the status of the minis is mixed, e.g. "Mixed: 3 built, 2 primed"', () => {
    const minis = [mini('1', { status: 'primed' }), mini('2'), mini('3', { status: 'primed' }), mini('4'), mini('5')];

    const line = mixedStatus(minis);

    expect(line).toBe('Mixed: 3 built, 2 primed');
  });

  it('counts how many of the minis carry each faction and each part', () => {
    const minis = [
      mini('1', { factionIds: [ORKS, BLOOD_AXES], parts: [{ partId: 'slugga', isSwappable: false }] }),
      mini('2', { factionIds: [ORKS], parts: [{ partId: 'slugga', isSwappable: false }] }),
      mini('3', { factionIds: [ORKS, BLOOD_AXES], parts: [{ partId: 'choppa', isSwappable: false }] }),
    ];

    const shares = { factions: factionShares(minis), parts: partShares(minis) };

    expect(shares.factions).toEqual([
      { id: ORKS, count: 3 },
      { id: BLOOD_AXES, count: 2 },
    ]);
    expect(shares.parts.map(({ partId, count }) => ({ partId, count }))).toEqual([
      { partId: 'slugga', count: 2 },
      { partId: 'choppa', count: 1 },
    ]);
  });

  it('names a part carried glued and swappable as mixed', () => {
    const minis = [
      mini('1', { parts: [{ partId: 'power-klaw', isSwappable: false }] }),
      mini('2', { parts: [{ partId: 'power-klaw', isSwappable: true }] }),
    ];

    const [share] = partShares(minis);

    expect(share?.carried).toBe('mixed');
  });

  it("counts how many of the minis can't go on the workbench", () => {
    const minis = [
      mini('built'),
      mini('done', { status: 'done' }),
      mini('sold', { departure: { reason: 'sold', on: '2026-10-20' } }),
    ];

    const count = workbenchRefusals(minis);

    expect(count).toBe(2);
  });

  it('sums up the changes, e.g. "Status and 1 part change on 5 minis."', () => {
    const changes = { status: 'painted' as const, addParts: [{ name: 'Stikkbomb', isSwappable: false }] };

    const summary = changesSummary(changes, 5);

    expect(summary).toBe('Status and 1 part change on 5 minis.');
  });
});
