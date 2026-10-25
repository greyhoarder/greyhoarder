import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import type { Box, Mini } from '@greyhoarder/domain/hoard';
import { HoardView } from '../../data/hoard-view';
import { HttpBoxesAdapter } from '../../infrastructure/http-boxes-adapter';
import { HttpMinisAdapter } from '../../infrastructure/http-minis-adapter';
import { BoxesPage } from './boxes-page';

const box = (id: string, tags: string[]): Box => ({
  id,
  name: 'Boyz (2026)',
  factionIds: [],
  tags,
  addedOn: '2026-10-12',
});

const BOXES: Box[] = [box('b1', ['Second hand']), box('b2', []), box('b3', ['Second hand', 'Gift'])];

const MINIS: Mini[] = BOXES.map((each) => ({
  id: `m-${each.id}`,
  name: 'Boy',
  factionIds: [],
  status: 'sprue',
  parts: [],
  boxId: each.id,
  isOnWorkbench: false,
}));

describe('Boxes page', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: HttpBoxesAdapter,
          useValue: { list: vi.fn(async () => ({ boxes: BOXES, factionNames: new Map() })) },
        },
        {
          provide: HttpMinisAdapter,
          useValue: { list: vi.fn(async () => ({ minis: MINIS, factionNames: new Map(), systemNames: new Map() })) },
        },
      ],
    });
  });

  it('shows only the boxes whose name, kit or tag contains the search', async () => {
    const fixture = TestBed.createComponent(BoxesPage);
    await fixture.whenStable();
    const page: HTMLElement = fixture.nativeElement;
    const search = page.querySelector<HTMLInputElement>('[data-testid="hoard-box-search"]');

    if (search) {
      search.value = 'second';
      search.dispatchEvent(new Event('input'));
    }
    await fixture.whenStable();

    expect(page.querySelectorAll('[data-testid="hoard-box"]')).toHaveLength(2);
  });

  it('says that there are no boxes yet while the hoard is empty', async () => {
    TestBed.overrideProvider(HttpBoxesAdapter, {
      useValue: { list: vi.fn(async () => ({ boxes: [], factionNames: new Map() })) },
    });
    const fixture = TestBed.createComponent(BoxesPage);

    await fixture.whenStable();

    const page: HTMLElement = fixture.nativeElement;
    expect(page.querySelector('[data-testid="hoard-box-empty"]')?.textContent?.trim()).toBe(
      'No boxes yet. Add your first box to start your hoard.',
    );
    expect(page.querySelector('[data-testid="hoard-box-no-results"]')).toBeNull();
  });

  it('opens a box with a click on its card', async () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const fixture = TestBed.createComponent(BoxesPage);
    await fixture.whenStable();

    (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>('[data-testid="hoard-box"]')?.click();

    expect(navigate).toHaveBeenCalledWith(['/hoard/boxes', 'b1']);
  });

  it('opens a box with a click on its table line', async () => {
    TestBed.inject(HoardView).mode.set('table');
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const fixture = TestBed.createComponent(BoxesPage);
    await fixture.whenStable();

    (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>('[data-testid="hoard-box"]')?.click();

    expect(navigate).toHaveBeenCalledWith(['/hoard/boxes', expect.stringMatching(/^b[123]$/)]);
  });

  it('offers the name of each box card as a button that opens the box', async () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const fixture = TestBed.createComponent(BoxesPage);
    await fixture.whenStable();
    const name = (fixture.nativeElement as HTMLElement)
      .querySelector('[data-testid="hoard-box"]')
      ?.querySelector<HTMLButtonElement>('button[type="button"]:not([aria-label])');

    name?.click();

    expect(name?.textContent?.trim()).toBe('Boyz (2026)');
    expect(navigate).toHaveBeenCalledWith(['/hoard/boxes', 'b1']);
  });

  it('offers the name of each table line as a button that opens the box', async () => {
    TestBed.inject(HoardView).mode.set('table');
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const fixture = TestBed.createComponent(BoxesPage);
    await fixture.whenStable();
    const name = (fixture.nativeElement as HTMLElement)
      .querySelector('[data-testid="hoard-box"]')
      ?.querySelector<HTMLButtonElement>('button[type="button"]:not([aria-label])');

    name?.click();

    expect(name?.textContent?.trim()).toBe('Boyz (2026)');
    expect(navigate).toHaveBeenCalledWith(['/hoard/boxes', expect.stringMatching(/^b[123]$/)]);
  });
});
