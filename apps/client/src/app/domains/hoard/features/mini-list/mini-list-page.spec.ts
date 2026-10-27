import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import type { Box, Mini } from '@greyhoarder/domain/hoard';
import { HoardView } from '../../application/hoard-view';
import { GONE } from '../../application/minis/mini-filter';
import { MinisList } from '../../application/minis/minis-list';
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

  /** What the server answers when minis are deleted. */
  let deleteMinis = vi.fn<HttpMinisAdapter['delete']>();

  /** A fresh page whose hoard holds what `loadMinis` answers, and these boxes. */
  function showPage(loadMinis: () => Promise<readonly Mini[]>, boxes: readonly Box[] = []): void {
    deleteMinis = vi.fn(async () => ({ emptiedBoxIds: [], minis: [] }));
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
          useValue: {
            list: vi.fn(async () => ({
              minis: await loadMinis(),
              factionNames: new Map(),
              systemNames: new Map(),
            })),
            delete: vi.fn((ids: readonly string[]) => deleteMinis(ids)),
          },
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

  const openGroup = async (index: number): Promise<void> => {
    byTestId('hoard-group-toggle')[index]?.click();
    await fixture.whenStable();
  };

  const showTable = async (): Promise<void> => {
    TestBed.inject(HoardView).mode.set('table');
    await fixture.whenStable();
  };

  it('shows only the minis with a matching part while searching', async () => {
    await search('klaw');

    expect(byTestId('hoard-group').map((group) => group.textContent)).toEqual([
      expect.stringContaining('Nob'),
    ]);
  });

  it('says that nothing matches when the search finds no minis', async () => {
    await search('grot tank');

    expect(byTestId('hoard-row')).toHaveLength(0);
    expect(textOf('hoard-no-results')).toBe('No minis match "grot tank".');
  });

  it('says that there are no minis yet while the hoard is empty', async () => {
    showPage(() => Promise.resolve([]));

    await fixture.whenStable();

    expect(byTestId('hoard-empty')).toHaveLength(1);
    expect(byTestId('hoard-no-results')).toHaveLength(0);
  });

  it('shows placeholders instead of a message while the hoard is loading', () => {
    showPage(() => new Promise(() => undefined));

    fixture.detectChanges();

    expect(byTestId('hoard-loading')).toHaveLength(1);
    expect(byTestId('hoard-empty')).toHaveLength(0);
    expect(byTestId('hoard-no-results')).toHaveLength(0);
  });

  it('opens a mini with a click on its line in an open group', async () => {
    await openGroup(0);
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    byTestId('hoard-row')[0]?.click();

    expect(navigate).toHaveBeenCalledWith(['/hoard/minis', 'm2']);
  });

  it('opens a mini with a click on its table line', async () => {
    await showTable();
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    byTestId('hoard-row')[0]?.click();

    expect(navigate).toHaveBeenCalledWith(['/hoard/minis', expect.stringMatching(/^m[23]$/)]);
  });

  it('leaves out minis still on the sprue', async () => {
    showPage(() =>
      Promise.resolve([mini('s1', { name: 'Grot' }), mini('b1', { name: 'Nob', status: 'built' })]),
    );
    await fixture.whenStable();

    await showTable();

    expect(byTestId('hoard-row').map((row) => row.textContent)).toEqual([
      expect.stringContaining('Nob'),
    ]);
  });

  it('shows a table line for every mini', async () => {
    showPage(() => Promise.resolve(['b1', 'b2', 'b3'].map((id) => mini(id, { status: 'built' }))));
    await fixture.whenStable();

    await showTable();

    expect(byTestId('hoard-row')).toHaveLength(3);
  });

  it('keeps a group open after coming back to the tab', async () => {
    await openGroup(0);

    fixture = TestBed.createComponent(MiniListPage);
    page = fixture.nativeElement;
    await fixture.whenStable();

    expect(byTestId('hoard-group-toggle')[0]?.getAttribute('aria-expanded')).toBe('true');
  });

  describe('with two boxes of the same name', () => {
    const box = (id: string, addedOn: string): Box => ({
      id,
      name: 'Boyz (2026)',
      factionIds: [],
      tags: [],
      addedOn,
      number: 1,
    });
    const BOXES = [box('b1', '2026-10-12'), box('b2', '2026-09-30')];

    beforeEach(async () => {
      showPage(
        () =>
          Promise.resolve([
            mini('m1', { boxId: 'b1', status: 'built' }),
            mini('m2', { name: 'Nob', boxId: 'b2', status: 'built' }),
          ]),
        BOXES,
      );
      await fixture.whenStable();
    });

    it('tells boxes with the same name apart in the box filter by the day they were added', async () => {
      byTestId('hoard-filter-box')[0]?.click();
      await fixture.whenStable();

      const options = [
        ...document.querySelectorAll('[data-testid="hoard-filter-option"] label'),
      ].map((label) => label.textContent?.trim());
      expect(options).toEqual(['Boyz (2026) · 12 Oct 2026', 'Boyz (2026) · 30 Sep 2026']);
    });

    it('shows only the minis of the ticked box, not those of another box with the same name', async () => {
      await showTable();
      TestBed.inject(MinisList).boxFilter.set(new Set(['b2']));
      await fixture.whenStable();

      expect(byTestId('hoard-row').map((row) => row.textContent)).toEqual([
        expect.stringContaining('Nob'),
      ]);
    });
  });

  /** Dialogs open in an overlay outside the page. */
  const inDocument = (testId: string): HTMLElement | null =>
    document.querySelector<HTMLElement>(`[data-testid="${testId}"]`);

  const click = async (element: HTMLElement | null | undefined): Promise<void> => {
    element?.click();
    await fixture.whenStable();
  };

  /** Ticks the first table line and deletes its mini after asking. */
  const deleteFirstLine = async (): Promise<void> => {
    await showTable();
    await click(byTestId('hoard-row-check')[0]);
    await click(byTestId('hoard-selection-delete')[0]);
    await click(inDocument('hoard-delete-confirm'));
  };

  it('deletes the selected minis after asking and ends selection mode', async () => {
    await showTable();
    const before = byTestId('hoard-row').length;

    await deleteFirstLine();

    expect(deleteMinis).toHaveBeenCalledOnce();
    expect(byTestId('hoard-row')).toHaveLength(before - 1);
    expect(byTestId('hoard-selection-bar')).toHaveLength(0);
  });

  it('offers no leaving when only gone minis are selected', async () => {
    showPage(() =>
      Promise.resolve([
        mini('gone', { status: 'built', departure: { reason: 'sold', on: '2026-10-20' } }),
      ]),
    );
    await fixture.whenStable();
    TestBed.inject(MinisList).statusFilter.set(new Set([GONE]));
    await showTable();

    await click(byTestId('hoard-row-check')[0]);

    expect((byTestId('hoard-selection-leave')[0] as HTMLButtonElement | undefined)?.disabled).toBe(
      true,
    );
  });

  it('asks whether to delete boxes left without minis', async () => {
    const boyz: Box = {
      id: 'boyz',
      name: 'Boyz',
      factionIds: [],
      tags: [],
      addedOn: '2026-10-25',
      number: 1,
    };
    showPage(() => Promise.resolve([mini('m2', { status: 'built', boxId: 'boyz' })]), [boyz]);
    await fixture.whenStable();
    deleteMinis.mockResolvedValue({ emptiedBoxIds: ['boyz'], minis: [] });

    await deleteFirstLine();

    expect(inDocument('hoard-empty-boxes-dialog')?.textContent).toContain('Boyz');
  });

  it('selects a mini with a long press on a touch screen', async () => {
    await showTable();
    const line = byTestId('hoard-row')[0];
    vi.useFakeTimers();

    line?.dispatchEvent(
      Object.assign(new MouseEvent('pointerdown', { bubbles: true }), { pointerType: 'touch' }),
    );
    vi.advanceTimersByTime(500);
    vi.useRealTimers();
    await fixture.whenStable();

    expect(textOf('hoard-selection-count')).toBe('1 mini selected');
  });
});
