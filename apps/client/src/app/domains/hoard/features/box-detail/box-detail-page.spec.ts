import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { provideRouter, Router } from '@angular/router';
import type { Box, HobbyStatus, Mini } from '@greyhoarder/domain/hoard';
import { HttpCatalogPartsAdapter, HttpKitsAdapter } from '../../../catalog/api';
import { MinisList } from '../../application/minis/minis-list';
import { HttpBoxesAdapter } from '../../infrastructure/http-boxes-adapter';
import { HttpMinisAdapter } from '../../infrastructure/http-minis-adapter';
import { HttpPartsAdapter } from '../../infrastructure/http-parts-adapter';
import { BoxDetailPage } from './box-detail-page';

const ORKS = 'warhammer-40000/orks';
const FREEBOOTERZ = 'warhammer-40000/freebooterz';

const BOYZ: Box = {
  id: 'b1',
  name: 'Boyz (2026)',
  kit: { id: 'games-workshop/orks/boyz-2026', version: 1, name: 'Boyz (2026)', sku: '50-80' },
  factionIds: [ORKS],
  tags: ['Gift', 'Second hand'],
  addedOn: '2026-10-12',
};

const mini = (id: string, status: HobbyStatus, overrides: Partial<Mini> = {}): Mini => ({
  id,
  name: 'Boy',
  factionIds: [ORKS],
  status,
  parts: [],
  boxId: BOYZ.id,
  isOnWorkbench: false,
  ...overrides,
});

const LOOSE: Box = {
  id: 'b2',
  name: 'Bits from a friend',
  factionIds: [ORKS],
  tags: [],
  addedOn: '2026-10-01',
};

const BOYZ_KIT = {
  id: 'games-workshop/orks/boyz-2026',
  version: 1,
  manufacturer: 'games-workshop',
  name: 'Boyz',
  factionIds: [ORKS],
  releases: [{ year: 2026, sku: '50-80' }],
  minis: 10,
  isDraft: false,
  contains: [],
  variants: [
    { name: 'Boyz', slots: [{ count: 10, buildsAs: ['Boy'], parts: [], factionIds: [] }] },
  ],
};

@Component({ template: '' })
class MinisTab {}

const MINIS: Mini[] = [
  mini('m1', 'sprue'),
  mini('m2', 'sprue'),
  mini('m3', 'built'),
  mini('m4', 'done'),
];

describe('Box page', () => {
  let fixture: ComponentFixture<BoxDetailPage>;
  const findKit = vi.fn(async () => ({
    kits: [BOYZ_KIT],
    containedKits: new Map(),
    factionNames: new Map(),
  }));

  /** A fresh page for the box with this id, whose hoard holds what `loadMinis` answers. */
  function showBox(
    id: string,
    loadMinis: () => Promise<readonly Mini[]> = () => Promise.resolve(MINIS),
  ): void {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'hoard/minis', component: MinisTab }]),
        {
          provide: HttpBoxesAdapter,
          useValue: {
            list: vi.fn(async () => ({
              boxes: [BOYZ, LOOSE],
              factionNames: new Map([[ORKS, 'Orks']]),
            })),
          },
        },
        { provide: HttpKitsAdapter, useValue: { find: findKit } },
        { provide: HttpCatalogPartsAdapter, useValue: { rangeParts: vi.fn(async () => []) } },
        { provide: HttpPartsAdapter, useValue: { list: vi.fn(async () => []) } },
        {
          provide: HttpMinisAdapter,
          useValue: {
            list: vi.fn(async () => ({
              minis: await loadMinis(),
              factionNames: new Map([[FREEBOOTERZ, 'Freebooterz']]),
              systemNames: new Map(),
            })),
          },
        },
      ],
    });
    fixture = TestBed.createComponent(BoxDetailPage);
    fixture.componentRef.setInput('id', id);
  }

  const all = (testId: string): HTMLElement[] => [
    ...(fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>(
      `[data-testid="${testId}"]`,
    ),
  ];
  const textOf = (testId: string): string =>
    all(testId)[0]?.textContent?.replace(/\s+/g, ' ').trim() ?? '';
  const groupTexts = (): string[] =>
    all('box-group-toggle').map((toggle) => toggle.textContent?.replace(/\s+/g, ' ').trim() ?? '');

  it('says the name of the box as the title', async () => {
    showBox(BOYZ.id);

    await fixture.whenStable();

    expect(textOf('box-name')).toBe('Boyz (2026)');
  });

  it('names the browser tab after the box', async () => {
    showBox(BOYZ.id);

    await fixture.whenStable();

    expect(TestBed.inject(Title).getTitle()).toBe('Boyz (2026) · Greyhoarder');
  });

  it('says what kit the box was added from, with its product code', async () => {
    showBox(BOYZ.id);

    await fixture.whenStable();

    expect(textOf('box-kit-line')).toBe('Boyz (2026) · 50-80');
  });

  it('says the factions of the box and the day it was added', async () => {
    showBox(BOYZ.id);

    await fixture.whenStable();

    expect(textOf('box-meta')).toBe('Orks · added 12 Oct 2026');
  });

  it('shows the tags of the box', async () => {
    showBox(BOYZ.id);

    await fixture.whenStable();

    expect(all('box-tag').map((tag) => tag.textContent?.trim())).toEqual(['Gift', 'Second hand']);
  });

  it('names the progress of the box', async () => {
    showBox(BOYZ.id);

    await fixture.whenStable();

    expect(textOf('box-progress-badge')).toBe('Started');
  });

  it('names the progress of the box as a percentage', async () => {
    showBox(BOYZ.id);

    await fixture.whenStable();

    // sprue 0, sprue 0, built 25, done 100: 125 / 4 = 31.25
    expect(textOf('box-percent')).toBe('31%');
  });

  it('shows a tile for every status with how many minis have it, also none', async () => {
    showBox(BOYZ.id);

    await fixture.whenStable();

    const tiles = all('box-status').map((tile) =>
      [...tile.querySelectorAll('span')].map((part) => part.textContent?.trim()).filter(Boolean),
    );
    expect(tiles).toEqual([
      ['On the sprue', '2'],
      ['Built', '1'],
      ['Primed', '0'],
      ['Painted', '0'],
      ['Done', '1'],
    ]);
  });

  it('offers to take minis from the sprue only while some are still on it', async () => {
    showBox(BOYZ.id, () => Promise.resolve([mini('m1', 'built'), mini('m2', 'done')]));

    await fixture.whenStable();

    expect(all('box-take')).toHaveLength(0);
  });

  it('shows placeholders while the hoard loads', () => {
    showBox(BOYZ.id, () => new Promise(() => undefined));

    fixture.detectChanges();

    expect(all('box-loading')).toHaveLength(1);
  });

  it("says that the box isn't in the hoard when there is no box with its id", async () => {
    showBox('unknown');

    await fixture.whenStable();

    expect(all('box-not-found')).toHaveLength(1);
  });

  it("says that the box can't be loaded when the hoard does not load", async () => {
    showBox(BOYZ.id, () => Promise.reject(new Error('offline')));

    await fixture.whenStable();

    expect(all('box-error')).toHaveLength(1);
  });

  it('shows the minis on the sprue, alike ones as one row', async () => {
    showBox(BOYZ.id, () =>
      Promise.resolve([
        mini('m1', 'sprue'),
        mini('m2', 'sprue'),
        mini('m3', 'sprue', { name: 'Nob' }),
      ]),
    );

    await fixture.whenStable();

    expect(all('box-sprue')).toHaveLength(2);
  });

  it('shows the groups from the furthest status back to built, then by name', async () => {
    showBox(BOYZ.id, () =>
      Promise.resolve([
        mini('m1', 'built', { name: 'Grot' }),
        mini('m2', 'primed', { name: 'Nob' }),
        mini('m3', 'done'),
        mini('m4', 'built', { name: 'Ammo Runt' }),
      ]),
    );

    await fixture.whenStable();

    expect(groupTexts()).toEqual([
      expect.stringMatching(/^Boy/),
      expect.stringMatching(/^Nob/),
      expect.stringMatching(/^Ammo Runt/),
      expect.stringMatching(/^Grot/),
    ]);
  });

  it('does not show the box on the cards of its own minis', async () => {
    showBox(BOYZ.id);

    await fixture.whenStable();

    const cards = [...all('box-group'), ...all('box-sprue')];
    expect([all('box-group').length > 0, all('box-sprue').length > 0]).toEqual([true, true]);
    expect(cards.some((card) => card.textContent?.includes(BOYZ.name))).toBe(false);
  });

  it('says how many minis are built and how many are still on the sprue', async () => {
    showBox(BOYZ.id);

    await fixture.whenStable();

    const heading = (id: string): string | undefined =>
      (fixture.nativeElement as HTMLElement)
        .querySelector(`#${id}`)
        ?.textContent?.replace(/\s+/g, ' ')
        .trim();
    expect([heading('box-minis-heading'), heading('box-sprue-heading')]).toEqual([
      'Minis 2',
      'On the sprue 2',
    ]);
  });

  it('leads to the minis of the box in the hoard', async () => {
    showBox(BOYZ.id);
    await fixture.whenStable();

    all('box-show-in-hoard')[0]?.click();
    await fixture.whenStable();

    expect(TestBed.inject(Router).url).toBe('/hoard/minis');
    expect(TestBed.inject(MinisList).boxFilter()).toEqual(new Set([BOYZ.id]));
  });

  it('shows the kit the box was added from, in the version the box records', async () => {
    showBox(BOYZ.id);

    await fixture.whenStable();

    expect(findKit).toHaveBeenCalledWith('games-workshop/orks/boyz-2026', 1);
    expect(all('box-kit')).toHaveLength(1);
  });

  it('shows no kit card for a box without a kit', async () => {
    showBox(LOOSE.id, () => Promise.resolve([mini('m1', 'sprue', { boxId: LOOSE.id })]));

    await fixture.whenStable();

    expect(all('box-kit')).toHaveLength(0);
  });

  /** The menu opens in an overlay outside the page. */
  async function openMenu(): Promise<HTMLElement | null> {
    showBox(BOYZ.id);
    await fixture.whenStable();
    all('box-menu')[0]?.click();
    await fixture.whenStable();
    return document.querySelector<HTMLElement>('[role="menu"]');
  }

  it('offers to show the minis, add a mini and delete the box from its menu', async () => {
    const menu = await openMenu();

    const items = [...(menu?.querySelectorAll('[role="menuitem"]') ?? [])];

    expect(items.map((item) => item.getAttribute('data-testid'))).toEqual([
      'box-show-minis',
      'box-add-mini',
      'box-delete',
    ]);
  });

  it('tells screen readers whether the box menu is open', async () => {
    showBox(BOYZ.id);
    await fixture.whenStable();
    const trigger = all('box-menu')[0];
    const before = trigger?.getAttribute('aria-expanded');

    trigger?.click();
    await fixture.whenStable();

    expect([before, trigger?.getAttribute('aria-expanded')]).toEqual(['false', 'true']);
  });

  it('leads to the minis of the box in the hoard from its menu', async () => {
    const menu = await openMenu();

    menu?.querySelector<HTMLElement>('[data-testid="box-show-minis"]')?.click();
    await fixture.whenStable();

    expect(TestBed.inject(Router).url).toBe('/hoard/minis');
    expect(TestBed.inject(MinisList).boxFilter()).toEqual(new Set([BOYZ.id]));
  });

  it("says that the kit can't be loaded when the server does not answer for it", async () => {
    findKit.mockRejectedValueOnce(new Error('offline'));
    showBox(BOYZ.id);

    await fixture.whenStable();

    expect(all('box-kit-error')).toHaveLength(1);
    expect(all('box-kit')).toHaveLength(0);
  });

  it('says that the catalog no longer has the kit when its version is missing', async () => {
    findKit.mockResolvedValueOnce({ kits: [], containedKits: new Map(), factionNames: new Map() });
    showBox(BOYZ.id);

    await fixture.whenStable();

    expect(all('box-kit-missing')).toHaveLength(1);
    expect(all('box-kit')).toHaveLength(0);
  });

  it('opens a mini of the box with a click on it', async () => {
    showBox(BOYZ.id);
    await fixture.whenStable();
    all('box-group-toggle')[0]?.click();
    await fixture.whenStable();
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    all('box-group-mini-open')[0]?.click();

    expect(navigate).toHaveBeenCalledWith(['/hoard/minis', 'm4'], { queryParams: { from: 'box' } });
  });

  it('opens the first card on the sprue with "Take from the sprue"', async () => {
    showBox(BOYZ.id);
    await fixture.whenStable();

    all('box-take')[0]?.click();
    await fixture.whenStable();

    expect(all('box-sprue-panel')).toHaveLength(1);
  });
});
