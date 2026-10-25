import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import type { Box, Mini, Part } from '@greyhoarder/domain/hoard';
import { HttpCatalogPartsAdapter, HttpKitsAdapter } from '../../../catalog/api';
import { HttpBoxesAdapter } from '../../infrastructure/http-boxes-adapter';
import { HttpMinisAdapter } from '../../infrastructure/http-minis-adapter';
import { HttpPartsAdapter } from '../../infrastructure/http-parts-adapter';
import { MiniDetailPage } from './mini-detail-page';

const ORKS = 'warhammer-40000/orks';

const LOOTAS_BOX: Box = {
  id: 'b1',
  name: 'Lootas / Burna Boyz (2008)',
  kit: { id: 'games-workshop/orks/lootas-2008', version: 1, name: 'Lootas / Burna Boyz (2008)' },
  factionIds: [ORKS],
  tags: [],
  addedOn: '2026-10-25',
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
    { name: 'Lootas', slots: [slot(4, ['Loota'], ['Deffgun']), slot(1, ['Spanner'], ['Big Shoota', 'Rokkit Launcha'])] },
    { name: 'Burna Boyz', slots: [slot(4, ['Burna Boy'], ['Burna']), slot(1, ['Spanner'], ['Big Shoota', 'Rokkit Launcha'])] },
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

/** Three Lootas of the same box, built; one Loota is left in the box. */
const THREE_LOOTAS = ['m5', 'm6', 'm7'].map((id) => mini(id, { name: 'Loota', status: 'built' }));

describe('Mini page', () => {
  let fixture: ComponentFixture<MiniDetailPage>;
  let update: ReturnType<typeof vi.fn>;
  let list: ReturnType<typeof vi.fn>;

  /** A fresh page for the mini with this id, whose hoard holds what `loadMinis` answers. */
  function showMini(
    id: string,
    loadMinis: () => Promise<readonly Mini[]> = () => Promise.resolve(ON_THE_SPRUE),
    saves: () => Promise<readonly Mini[]> = () => Promise.resolve([]),
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
        { provide: HttpPartsAdapter, useValue: { list: vi.fn(async () => PARTS) } },
        {
          provide: HttpKitsAdapter,
          useValue: {
            find: vi.fn(async () => ({ kits: [LOOTAS_KIT], containedKits: new Map(), factionNames: new Map() })),
          },
        },
        { provide: HttpCatalogPartsAdapter, useValue: { rangeParts: vi.fn(async () => []) } },
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

  it('warns when more minis are to be built than are left for the chosen name', async () => {
    showMini('m1', () => Promise.resolve([...ON_THE_SPRUE, ...THREE_LOOTAS]));
    await fixture.whenStable();
    await click(nameTile('Loota'));

    await click(all('mini-build-more')[0]);

    const hint = nameTile('Loota')?.querySelector('[data-testid="mini-name-left"]');
    expect(hint?.getAttribute('data-warning')).toBe('true');
    expect(hint?.textContent).toContain('1');
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

  it('tells screen readers whether the part picker is open', async () => {
    showMini('m1');
    await fixture.whenStable();
    const addPart = all('mini-add-part')[0];
    const closed = addPart?.getAttribute('aria-expanded');

    await click(addPart);

    expect([closed, addPart?.getAttribute('aria-expanded')]).toEqual(['false', 'true']);
  });

  it('tells screen readers whether a part is swappable', async () => {
    showMini('m1');
    await fixture.whenStable();
    await click(nameTile('Loota'));
    const glued = all('mini-part-swappable')[0]?.getAttribute('aria-pressed');

    await click(all('mini-part-swappable')[0]);

    expect([glued, all('mini-part-swappable')[0]?.getAttribute('aria-pressed')]).toEqual(['false', 'true']);
  });

  it('offers to build only once a name is chosen', async () => {
    showMini('m1');
    await fixture.whenStable();
    const before = (all('mini-build')[0] as HTMLButtonElement).disabled;

    await click(nameTile('Loota'));

    expect([before, (all('mini-build')[0] as HTMLButtonElement).disabled]).toEqual([true, false]);
  });

  it('builds as many minis of the row as chosen, the one of the address first, with what was chosen', async () => {
    showMini('m3');
    await fixture.whenStable();
    await click(nameTile('Loota'));
    await click(all('mini-build-more')[0]);

    await click(all('mini-build')[0]);

    expect(update).toHaveBeenCalledWith(
      ['m3', 'm1'],
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

  it('saves a change past the sprue for every mini of the row at once', async () => {
    showMini('m1', () => Promise.resolve(BUILT));
    await fixture.whenStable();

    await click(all('mini-workbench')[0]);

    expect(update).toHaveBeenCalledWith(['m1', 'm2'], { isOnWorkbench: true });
  });

  it('shows what the server stored after a change without loading the hoard again', async () => {
    showMini(
      'm1',
      () => Promise.resolve(BUILT),
      () => Promise.resolve(BUILT.map((stored) => ({ ...stored, isOnWorkbench: true }))),
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
