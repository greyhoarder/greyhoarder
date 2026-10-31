import { withChanges } from './changes-to-minis.js';
import type { Mini } from './mini.js';

const ORKS = 'warhammer-40000/orks';
const BLOOD_AXES = 'own-blood-axes';

function mini(id: string, mini: Partial<Mini> = {}): Mini {
  return {
    id,
    name: 'Boy',
    factionIds: [ORKS],
    status: 'built',
    parts: [],
    boxId: 'b1',
    isOnWorkbench: false,
    ...mini,
  };
}

describe('Changes to several minis', () => {
  it('sets the chosen status on every mini', () => {
    const minis = [mini('1', { status: 'built' }), mini('2', { status: 'primed' })];

    const changed = minis.map((each) => withChanges(each, { status: 'painted' }));

    expect(changed.map((each) => each.status)).toEqual(['painted', 'painted']);
  });

  it('keeps what was not changed as each mini has it', () => {
    const boy = mini('1', {
      status: 'primed',
      factionIds: [ORKS, BLOOD_AXES],
      parts: [{ partId: 'slugga', isSwappable: false }],
      isOnWorkbench: true,
      notes: 'Green skin',
    });

    const changed = withChanges(boy, {});

    expect(changed).toEqual(boy);
  });

  it('adds a part to the parts each mini carries', () => {
    const minis = [
      mini('1', { parts: [{ partId: 'slugga', isSwappable: false }] }),
      mini('2', { parts: [{ partId: 'choppa', isSwappable: false }] }),
    ];

    const changed = minis.map((each) => withChanges(each, { addParts: [{ partId: 'stikkbomb', isSwappable: false }] }));

    expect(changed.map((each) => each.parts.map((part) => part.partId))).toEqual([
      ['slugga', 'stikkbomb'],
      ['choppa', 'stikkbomb'],
    ]);
  });

  it('keeps a part once, glued or swappable as chosen, when a mini carries it already', () => {
    const nob = mini('1', { parts: [{ partId: 'power-klaw', isSwappable: false }] });

    const changed = withChanges(nob, { addParts: [{ partId: 'power-klaw', isSwappable: true }] });

    expect(changed.parts).toEqual([{ partId: 'power-klaw', isSwappable: true }]);
  });

  it('removes a faction from the minis that carry it and keeps their others', () => {
    const minis = [mini('1', { factionIds: [ORKS, BLOOD_AXES] }), mini('2', { factionIds: [ORKS] })];

    const changed = minis.map((each) => withChanges(each, { removeFactionIds: [BLOOD_AXES] }));

    expect(changed.map((each) => each.factionIds)).toEqual([[ORKS], [ORKS]]);
  });

  it('puts only minis on the workbench that are neither done nor gone', () => {
    const minis = [
      mini('built'),
      mini('done', { status: 'done' }),
      mini('sold', { departure: { reason: 'sold', on: '2026-10-25' } }),
    ];

    const changed = minis.map((each) => withChanges(each, { workbench: 'put-on' }));

    expect(changed.map((each) => [each.id, each.isOnWorkbench])).toEqual([
      ['built', true],
      ['done', false],
      ['sold', false],
    ]);
  });

  it('takes the minis off the workbench once they are set to done', () => {
    const painted = mini('1', { status: 'painted', isOnWorkbench: true });

    const changed = withChanges(painted, { status: 'done', workbench: 'put-on' });

    expect(changed.isOnWorkbench).toBe(false);
  });
});
