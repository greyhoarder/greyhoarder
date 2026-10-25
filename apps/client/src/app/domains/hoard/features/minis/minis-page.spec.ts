import { ComponentFixture, TestBed } from '@angular/core/testing';
import type { Mini } from '@greyhoarder/domain/hoard';
import { HttpBoxesAdapter } from '../../infrastructure/http-boxes-adapter';
import { HttpMinisAdapter } from '../../infrastructure/http-minis-adapter';
import { MinisPage } from './minis-page';

const mini = (id: string, overrides: Partial<Mini>): Mini => ({
  id,
  name: 'Boy',
  factionIds: [],
  status: 'sprue',
  parts: [],
  isOnWorkbench: false,
  ...overrides,
});

const MINIS: Mini[] = [
  mini('m1', {}),
  mini('m2', { parts: ['Slugga', 'Choppa'], status: 'built' }),
  mini('m3', { name: 'Nob', parts: ['Power Klaw'], status: 'built' }),
];

describe('Minis page', () => {
  let fixture: ComponentFixture<MinisPage>;
  let page: HTMLElement;

  /** A fresh page whose hoard holds what `loadMinis` answers. */
  function showPage(loadMinis: () => Promise<readonly Mini[]>): void {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        {
          provide: HttpBoxesAdapter,
          useValue: { list: vi.fn(async () => ({ boxes: [], factionNames: new Map() })) },
        },
        {
          provide: HttpMinisAdapter,
          useValue: { list: vi.fn(async () => ({ minis: await loadMinis(), factionNames: new Map() })) },
        },
      ],
    });
    fixture = TestBed.createComponent(MinisPage);
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
});
