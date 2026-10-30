import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import type { Box, Mini, Part } from '@greyhoarder/domain/hoard';
import { HttpCatalogFactionsAdapter, HttpCatalogPartsAdapter, HttpKitsAdapter } from '../../../catalog/api';
import { HttpBoxesAdapter } from '../../infrastructure/http-boxes-adapter';
import { HttpMinisAdapter } from '../../infrastructure/http-minis-adapter';
import { HttpPartsAdapter } from '../../infrastructure/http-parts-adapter';
import type { ChangedMinis } from '../../models/changed-minis';
import { MiniDetailPage } from './mini-detail-page';

const ORKS = 'warhammer-40000/orks';

const LOOTAS_BOX: Box = {
  id: 'b1',
  name: 'Lootas / Burna Boyz (2008)',
  kit: { id: 'games-workshop/orks/lootas-2008', version: 1, name: 'Lootas / Burna Boyz (2008)' },
  factionIds: [ORKS],
  tags: [],
  addedOn: '2026-10-25',
  number: 1,
};

const slot = (count: number, buildsAs: string[], parts: string[]) => ({
  count,
  buildsAs,
  parts,
  factionIds: [],
});

const LOOTAS_KIT = {
  id: 'games-workshop/orks/lootas-2008',
  version: 1,
  manufacturer: 'games-workshop',
  name: 'Lootas',
  factionIds: [ORKS],
  releases: [{ year: 2008 }],
  minis: 5,
  isDraft: true,
  contains: [],
  variants: [
    {
      name: 'Lootas',
      slots: [slot(4, ['Loota'], ['Deffgun']), slot(1, ['Spanner'], ['Big Shoota', 'Rokkit Launcha'])],
    },
    {
      name: 'Burna Boyz',
      slots: [slot(4, ['Burna Boy'], ['Burna']), slot(1, ['Spanner'], ['Big Shoota', 'Rokkit Launcha'])],
    },
  ],
};

const PARTS: Part[] = [{ id: 'deffgun', name: 'Deffgun', aliases: [] }];

const mini = (id: string, overrides: Partial<Mini> = {}): Mini => ({
  id,
  name: 'Lootas / Burna Boyz',
  factionIds: [ORKS],
  status: 'sprue',
  parts: [],
  sprueName: 'Lootas / Burna Boyz',
  boxId: LOOTAS_BOX.id,
  isOnWorkbench: false,
  ...overrides,
});

/** Four alike minis on the sprue, one row. */
const ON_THE_SPRUE = ['m1', 'm2', 'm3', 'm4'].map((id) => mini(id));

/** Two alike Lootas, built. */
const BUILT = ['m1', 'm2'].map((id) =>
  mini(id, { name: 'Loota', status: 'built', parts: [{ partId: 'deffgun', isSwappable: false }] }),
);

describe('Mini page', () => {
  let fixture: ComponentFixture<MiniDetailPage>;
  let update: ReturnType<typeof vi.fn>;
  let list: ReturnType<typeof vi.fn>;
  let listParts: ReturnType<typeof vi.fn>;

  /** A fresh page for the mini with this id, whose hoard holds what `loadMinis` answers. */
  function showMini(
    id: string,
    loadMinis: () => Promise<readonly Mini[]> = () => Promise.resolve(ON_THE_SPRUE),
    saves: () => Promise<ChangedMinis> = () => Promise.resolve({ minis: [], ownFactionNames: new Map() }),
  ): void {
    update = vi.fn(saves);
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: HttpBoxesAdapter,
          useValue: { list: vi.fn(async () => ({ boxes: [LOOTAS_BOX], factionNames: new Map() })) },
        },
        {
          provide: HttpMinisAdapter,
          useValue: {
            list: (list = vi.fn(async () => ({
              minis: await loadMinis(),
              factionNames: new Map([[ORKS, 'Orks']]),
              systemNames: new Map(),
            }))),
            update,
          },
        },
        { provide: HttpPartsAdapter, useValue: { list: (listParts = vi.fn(async () => PARTS)) } },
        {
          provide: HttpKitsAdapter,
          useValue: {
            find: vi.fn(async () => ({
              kits: [LOOTAS_KIT],
              containedKits: new Map(),
              factionNames: new Map(),
            })),
          },
        },
        { provide: HttpCatalogPartsAdapter, useValue: { rangeParts: vi.fn(async () => []) } },
        {
          provide: HttpCatalogFactionsAdapter,
          useValue: {
            search: vi.fn(async () => [
              {
                id: 'warhammer-40000/space-marines',
                name: 'Space Marines',
                systemName: 'Warhammer 40,000',
              },
            ]),
          },
        },
      ],
    });
    fixture = TestBed.createComponent(MiniDetailPage);
    fixture.componentRef.setInput('id', id);
  }

  const all = (testId: string): HTMLElement[] => [
    ...(fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>(`[data-testid="${testId}"]`),
  ];
  const textsOf = (testId: string): string[] =>
    all(testId).map((element) => element.textContent?.replace(/\s+/g, ' ').trim() ?? '');
  const nameTile = (name: string) =>
    all('mini-build-as').find(
      (tile) => tile.querySelector('[data-testid="mini-build-as-name"]')?.textContent?.trim() === name,
    );
  const partNames = () => textsOf('mini-part-name');

  async function click(element: HTMLElement | undefined): Promise<void> {
    element?.click();
    await fixture.whenStable();
  }

  /** Opens "+ Faction" and types into its search, which opens in a popover outside the page. */
  async function searchFactions(text: string): Promise<void> {
    await click(all('mini-add-faction')[0]);
    const field = document.querySelector<HTMLInputElement>('[data-testid="mini-faction-search"]');
    if (field) {
      field.value = text;
      field.dispatchEvent(new Event('input'));
    }
    await fixture.whenStable();
  }

  const inPopover = (testId: string): HTMLElement | undefined =>
    document.querySelector<HTMLElement>(`[data-testid="${testId}"]`) ?? undefined;

  it('says the name of the minis as the title until a name is chosen', async () => {
    showMini('m1');
    await fixture.whenStable();
    const before = textsOf('mini-name');

    await click(nameTile('Loota'));

    expect([before, textsOf('mini-name')]).toEqual([['Lootas or Burna Boyz'], ['Loota']]);
  });

  it('names the browser tab after the minis', async () => {
    showMini('m1');

    await fixture.whenStable();

    expect(TestBed.inject(Title).getTitle()).toBe('Lootas or Burna Boyz · Greyhoarder');
  });

  it('shows the factions of the minis', async () => {
    showMini('m1');

    await fixture.whenStable();

    expect(textsOf('mini-faction')).toEqual(['Orks']);
  });

  it('shows how far the minis are', async () => {
    showMini('m1', () => Promise.resolve(BUILT));

    await fixture.whenStable();

    expect(textsOf('mini-percent')).toEqual(['25%']);
    expect(textsOf('mini-status-badge')).toEqual(['Built']);
  });

  it('shows a tile for every name suggested for the minis with how many are left in the box', async () => {
    showMini('m1');

    await fixture.whenStable();

    const tiles = all('mini-build-as').map((tile) => [
      tile.querySelector('[data-testid="mini-build-as-name"]')?.textContent?.trim(),
      tile.querySelector('[data-testid="mini-name-left"]')?.textContent?.trim(),
    ]);
    expect(tiles).toEqual([
      ['Loota', '4 left in this box'],
      ['Burna Boy', '4 left in this box'],
    ]);
  });

  it('offers a mini on the sprue without a box its own name, chosen', async () => {
    const loose: Mini = {
      id: 'n1',
      name: 'Nob',
      factionIds: [ORKS],
      status: 'sprue',
      parts: [],
      sprueName: 'Nob',
      isOnWorkbench: false,
    };
    showMini('n1', () => Promise.resolve([loose]));

    await fixture.whenStable();

    const tiles = all('mini-build-as').map((tile) => [
      tile.querySelector('[data-testid="mini-build-as-name"]')?.textContent?.trim(),
      tile.getAttribute('aria-pressed'),
    ]);
    expect(tiles).toEqual([['Nob', 'true']]);
  });

  it("offers a mini without a box what its kit's slot can build it as", async () => {
    const loose: Mini = {
      id: 'l1',
      name: 'Loota',
      factionIds: [ORKS],
      status: 'sprue',
      parts: [],
      sprueName: 'Loota',
      kit: { id: LOOTAS_KIT.id, version: 1, name: 'Lootas / Burna Boyz (2008)' },
      isOnWorkbench: false,
    };
    showMini('l1', () => Promise.resolve([loose]));

    await fixture.whenStable();

    const tiles = all('mini-build-as').map((tile) => [
      tile.querySelector('[data-testid="mini-build-as-name"]')?.textContent?.trim(),
      tile.querySelector('[data-testid="mini-name-left"]'),
      tile.getAttribute('aria-pressed'),
    ]);
    expect(tiles).toEqual([['Loota', null, 'true']]);
    expect(fixture.nativeElement.textContent).toContain('Suggested by Lootas or Burna Boyz (2008)');
  });

  it('preselects the parts for the chosen name', async () => {
    showMini('m1');
    await fixture.whenStable();

    await click(nameTile('Loota'));

    expect(partNames()).toEqual(['Deffgun']);
  });

  it('keeps the parts the user changed when another name is chosen', async () => {
    showMini('m1');
    await fixture.whenStable();
    await click(nameTile('Loota'));
    await click(all('mini-part-remove')[0]);

    await click(nameTile('Burna Boy'));

    expect(partNames()).toEqual([]);
  });

  it("adds a part chosen in the picker to the minis' parts", async () => {
    showMini('m1');
    await fixture.whenStable();
    await click(all('mini-add-part')[0]);

    await click(all('mini-part-option').find((option) => option.textContent?.includes('Deffgun')));

    expect(partNames()).toEqual(['Deffgun']);
  });

  it('builds only this mini with what was chosen, its alike minis stay on the sprue', async () => {
    showMini('m3');
    await fixture.whenStable();
    await click(nameTile('Loota'));

    await click(all('mini-build')[0]);

    expect(update).toHaveBeenCalledWith(
      ['m3'],
      expect.objectContaining({
        name: 'Loota',
        status: 'built',
        parts: [{ partId: 'deffgun', isSwappable: false }],
        isOnWorkbench: true,
      }),
    );
  });

  it('says that nothing is saved until the minis are built', async () => {
    showMini('m1');

    await fixture.whenStable();

    expect(textsOf('mini-save-note')).toEqual(['Nothing is saved until you build it']);
  });

  it('saves a change past the sprue for this mini only', async () => {
    showMini('m1', () => Promise.resolve(BUILT));
    await fixture.whenStable();

    await click(all('mini-workbench')[0]);

    expect(update).toHaveBeenCalledWith(['m1'], { isOnWorkbench: true });
  });

  it('gives a built mini a faction found by the search', async () => {
    showMini('m1', () => Promise.resolve(BUILT));
    await fixture.whenStable();
    await searchFactions('space');

    await click(inPopover('mini-faction-result'));

    expect(update).toHaveBeenCalledWith(['m1'], {
      factions: [{ id: ORKS }, { id: 'warhammer-40000/space-marines' }],
    });
  });

  it("gives a built mini a new faction of the user's own", async () => {
    showMini(
      'm1',
      () => Promise.resolve(BUILT),
      () =>
        Promise.resolve({
          minis: BUILT.map((stored) => ({ ...stored, factionIds: [ORKS, 'own/crimson-wolves'] })),
          ownFactionNames: new Map([['own/crimson-wolves', 'Crimson Wolves']]),
        }),
    );
    await fixture.whenStable();
    await searchFactions('Crimson Wolves');

    await click(inPopover('mini-faction-create'));

    expect(update).toHaveBeenCalledWith(['m1'], {
      factions: [{ id: ORKS }, { name: 'Crimson Wolves' }],
    });
    expect(textsOf('mini-faction')).toEqual(['Orks', 'Crimson Wolves · own']);
  });

  it("builds a mini with a new faction of the user's own", async () => {
    showMini('m1');
    await fixture.whenStable();
    await click(nameTile('Loota'));
    await searchFactions('Crimson Wolves');
    await click(inPopover('mini-faction-create'));
    expect(textsOf('mini-faction')).toEqual(['Orks', 'Crimson Wolves · own']);
    expect(update).not.toHaveBeenCalled();

    await click(all('mini-build')[0]);

    expect(update).toHaveBeenCalledWith(
      ['m1'],
      expect.objectContaining({ factions: [{ id: ORKS }, { name: 'Crimson Wolves' }] }),
    );
  });

  it('loads the vocabulary anew after a change of parts', async () => {
    showMini('m1', () => Promise.resolve(BUILT));
    await fixture.whenStable();

    await click(all('mini-part-remove')[0]);

    expect(listParts).toHaveBeenCalledTimes(2);
  });

  it('shows what the server stored after a change without loading the hoard again', async () => {
    showMini(
      'm1',
      () => Promise.resolve(BUILT),
      () =>
        Promise.resolve({
          minis: BUILT.map((stored) => ({ ...stored, isOnWorkbench: true })),
          ownFactionNames: new Map(),
        }),
    );
    await fixture.whenStable();

    await click(all('mini-workbench')[0]);

    expect(all('mini-workbench')[0]?.getAttribute('aria-pressed')).toBe('true');
    expect(list).toHaveBeenCalledOnce();
  });

  it("says that a change can't be saved when the server does not answer", async () => {
    showMini(
      'm1',
      () => Promise.resolve(BUILT),
      () => Promise.reject(new Error('offline')),
    );
    await fixture.whenStable();

    await click(all('mini-workbench')[0]);

    expect(all('mini-save-error')).toHaveLength(1);
  });

  it("shows a part the user added even when it can't be saved", async () => {
    showMini(
      'm1',
      () => Promise.resolve(BUILT),
      () => Promise.reject(new Error('offline')),
    );
    await fixture.whenStable();
    await click(all('mini-add-part')[0]);

    await click(all('mini-part-option').find((option) => option.textContent?.includes('Burna')));

    expect(partNames()).toEqual(['Deffgun', 'Burna']);
    expect(all('mini-save-error')).toHaveLength(1);
  });

  it("shows a faction the user added even when it can't be saved", async () => {
    showMini(
      'm1',
      () => Promise.resolve(BUILT),
      () => Promise.reject(new Error('offline')),
    );
    await fixture.whenStable();
    await searchFactions('space');

    await click(inPopover('mini-faction-result'));

    expect(textsOf('mini-faction')).toEqual(['Orks', 'Space Marines']);
    expect(all('mini-save-error')).toHaveLength(1);
  });

  it('leads back to the box when opened from it', async () => {
    showMini('m1', () => Promise.resolve(BUILT));
    fixture.componentRef.setInput('from', 'box');

    await fixture.whenStable();

    const back = all('mini-back')[0];
    expect([back?.textContent?.trim(), back?.getAttribute('href')]).toEqual(['Box', '/hoard/boxes/b1']);
  });

  it('leads back to the hoard when opened from anywhere else', async () => {
    showMini('m1', () => Promise.resolve(BUILT));

    await fixture.whenStable();

    const back = all('mini-back')[0];
    expect([back?.textContent?.trim(), back?.getAttribute('href')]).toEqual(['Hoard', '/hoard/minis']);
  });

  it('shows placeholders while the hoard loads', () => {
    showMini('m1', () => new Promise(() => undefined));

    fixture.detectChanges();

    expect(all('mini-loading')).toHaveLength(1);
  });

  it("says that the mini isn't in the hoard when there is no mini with its id", async () => {
    showMini('unknown');

    await fixture.whenStable();

    expect(all('mini-not-found')).toHaveLength(1);
  });

  it("says that the mini can't be loaded when the hoard does not load", async () => {
    showMini('m1', () => Promise.reject(new Error('offline')));

    await fixture.whenStable();

    expect(all('mini-error')).toHaveLength(1);
  });
});
