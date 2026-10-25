import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import type { Box, Mini } from '@greyhoarder/domain/hoard';
import { MinisList } from '../../data/minis-list';
import { HttpBoxesAdapter } from '../../infrastructure/http-boxes-adapter';
import { HttpMinisAdapter } from '../../infrastructure/http-minis-adapter';
import { HoardLayout } from './hoard-layout';

const ORKS = 'warhammer-40000/orks';

const BOXES: Box[] = [
  { id: 'b1', name: 'Boyz (2026)', factionIds: [ORKS], tags: [], addedOn: '2026-10-12' },
  { id: 'b2', name: 'Boyz (2021)', factionIds: [ORKS], tags: [], addedOn: '2026-09-30' },
];

const mini = (id: string, overrides: Partial<Mini>): Mini => ({
  id,
  name: 'Boy',
  factionIds: [ORKS],
  status: 'sprue',
  parts: [],
  boxId: 'b1',
  isOnWorkbench: false,
  ...overrides,
});

const MINIS: Mini[] = [
  mini('m1', {}),
  mini('m2', {}),
  mini('m3', {}),
  mini('m4', { name: 'Nob', parts: ['Power Klaw'], status: 'painted' }),
  mini('m5', { boxId: 'b2', status: 'done' }),
];

describe('Hoard layout', () => {
  let fixture: ComponentFixture<HoardLayout>;

  /** Without boxes and minis, the server does not answer. */
  async function showHoard(hoard?: { boxes: readonly Box[]; minis: readonly Mini[] }) {
    const factionNames = new Map([[ORKS, 'Orks']]);
    const answer = <T>(value: T): Promise<T> =>
      hoard ? Promise.resolve(value) : Promise.reject(new Error('offline'));
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: HttpBoxesAdapter,
          useValue: { list: vi.fn(() => answer({ boxes: hoard?.boxes ?? [], factionNames })) },
        },
        {
          provide: HttpMinisAdapter,
          useValue: { list: vi.fn(() => answer({ minis: hoard?.minis ?? [], factionNames, systemNames: new Map() })) },
        },
      ],
    });
    fixture = TestBed.createComponent(HoardLayout);
    await fixture.whenStable();
  }

  const textOf = (testId: string): string =>
    (fixture.nativeElement as HTMLElement)
      .querySelector(`[data-testid="${testId}"]`)
      ?.textContent?.replace(/\s+/g, ' ')
      .trim() ?? '';

  it('sums up the minis, boxes and painted minis of the hoard', async () => {
    await showHoard({ boxes: BOXES, minis: MINIS });

    expect(textOf('hoard-summary')).toBe('5 minis from 2 boxes · 2 painted');
  });

  it('counts the shown minis on the tab while a search narrows the list', async () => {
    await showHoard({ boxes: BOXES, minis: MINIS });

    TestBed.inject(MinisList).query.set('klaw');
    await fixture.whenStable();

    expect(textOf('hoard-tab-minis-count')).toBe('1 of 5');
  });

  it("says that the hoard can't be loaded when the server does not answer", async () => {
    await showHoard();

    expect(textOf('hoard-error')).toBe("Can't load your hoard right now. Try again in a moment.");
  });
});
