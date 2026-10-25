import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import type { Box, Mini } from '@greyhoarder/domain/hoard';
import { HoardView } from '../../data/hoard-view';
import { MinisList } from '../../data/minis-list';
import { HttpBoxesAdapter } from '../../infrastructure/http-boxes-adapter';
import { HttpMinisAdapter } from '../../infrastructure/http-minis-adapter';
import { HttpPartsAdapter } from '../../infrastructure/http-parts-adapter';
import { MiniListPage } from './mini-list-page';

const mini = (id: string, overrides: Partial<Mini>): Mini => ({
  id,
  name: 'Boy',
  factionIds: [],
  status: 'sprue',
  parts: [],
  isOnWorkbench: false,
  ...overrides,
});

const glued = (partId: string) => ({ partId, isSwappable: false });

const PARTS = [
  { id: 'slugga', name: 'Slugga', aliases: [] },
  { id: 'choppa', name: 'Choppa', aliases: [] },
  { id: 'power-klaw', name: 'Power Klaw', aliases: [] },
];

const MINIS: Mini[] = [
  mini('m1', {}),
  mini('m2', { parts: [glued('slugga'), glued('choppa')], status: 'built' }),
  mini('m3', { name: 'Nob', parts: [glued('power-klaw')], status: 'built' }),
];

describe('Minis page', () => {
  let fixture: ComponentFixture<MiniListPage>;
  let page: HTMLElement;

  /** A fresh page whose hoard holds what `loadMinis` answers, and these boxes. */
  function showPage(loadMinis: () => Promise<readonly Mini[]>, boxes: readonly Box[] = []): void {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        {
          provide: HttpBoxesAdapter,
          useValue: { list: vi.fn(async () => ({ boxes, factionNames: new Map() })) },
        },
        { provide: HttpPartsAdapter, useValue: { list: vi.fn(async () => PARTS) } },
        {
          provide: HttpMinisAdapter,
          useValue: { list: vi.fn(async () => ({ minis: await loadMinis(), factionNames: new Map(), systemNames: new Map() })) },
        },
      ],
    });
    fixture = TestBed.createComponent(MiniListPage);
    page = fixture.nativeElement;
  }

  beforeEach(async () => {
    showPage(() => Promise.resolve(MINIS));
    await fixture.whenStable();
  });

  const byTestId = (testId: string): HTMLElement[] =>
    Array.from(page.querySelectorAll<HTMLElement>(`[data-testid="${testId}"]`));

  const textOf = (testId: string): string => byTestId(testId)[0]?.textContent?.trim() ?? '';

  const search = async (query: string): Promise<void> => {
    const field = byTestId('hoard-search')[0] as HTMLInputElement;
    field.value = query;
    field.dispatchEvent(new Event('input'));
    await fixture.whenStable();
  };

  it('shows only the rows with a matching part while searching', async () => {
    await search('klaw');

    expect(byTestId('hoard-row')).toHaveLength(1);
  });

  it('says that nothing matches when the search finds no minis', async () => {
    await search('grot tank');

    expect(byTestId('hoard-row')).toHaveLength(0);
    expect(textOf('hoard-no-results')).toBe('No minis match "grot tank".');
  });

  it('says that there are no minis yet while the hoard is empty', async () => {
    showPage(() => Promise.resolve([]));

    await fixture.whenStable();

    expect(textOf('hoard-empty')).toBe('No minis yet. Add a box and its minis appear here.');
    expect(byTestId('hoard-no-results')).toHaveLength(0);
  });

  it('shows placeholders instead of a message while the hoard is loading', () => {
    showPage(() => new Promise(() => undefined));

    fixture.detectChanges();

    expect(byTestId('hoard-loading')).toHaveLength(1);
    expect(byTestId('hoard-empty')).toHaveLength(0);
    expect(byTestId('hoard-no-results')).toHaveLength(0);
  });

  it('opens a row with a click on its card', async () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    byTestId('hoard-row')[0]?.click();

    expect(navigate).toHaveBeenCalledWith(['/hoard/minis', 'm1']);
  });

  it('opens a row with a click on its table line', async () => {
    TestBed.inject(HoardView).mode.set('table');
    await fixture.whenStable();
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    byTestId('hoard-row')[0]?.click();

    expect(navigate).toHaveBeenCalledWith(['/hoard/minis', expect.stringMatching(/^m[123]$/)]);
  });

  describe('with two boxes of the same name', () => {
    const box = (id: string, addedOn: string): Box => ({ id, name: 'Boyz (2026)', factionIds: [], tags: [], addedOn });
    const BOXES = [box('b1', '2026-10-12'), box('b2', '2026-09-30')];

    beforeEach(async () => {
      showPage(
        () => Promise.resolve([mini('m1', { boxId: 'b1' }), mini('m2', { name: 'Nob', boxId: 'b2' })]),
        BOXES,
      );
      await fixture.whenStable();
    });

    it('tells boxes with the same name apart in the box filter by the day they were added', async () => {
      byTestId('hoard-filter-box')[0]?.click();
      await fixture.whenStable();

      const options = [...document.querySelectorAll('[data-testid="hoard-filter-option"] label')].map((label) =>
        label.textContent?.trim(),
      );
      expect(options).toEqual([
        'Boyz (2026) · 12 Oct 2026',
        'Boyz (2026) · 30 Sep 2026',
      ]);
    });

    it('shows only the minis of the ticked box, not those of another box with the same name', async () => {
      TestBed.inject(MinisList).boxFilter.set(new Set(['b2']));
      await fixture.whenStable();

      expect(byTestId('hoard-row').map((row) => row.textContent)).toEqual([expect.stringContaining('Nob')]);
    });
  });
});
