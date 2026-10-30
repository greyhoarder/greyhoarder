import { type ComponentFixture, TestBed } from '@angular/core/testing';
import type { Box, Mini } from '@greyhoarder/domain/hoard';
import { HttpCatalogPartsAdapter, HttpKitsAdapter } from '../../../../catalog/api';
import type { MiniRow } from '../../../application/minis/mini-row';
import { HttpBoxesAdapter } from '../../../infrastructure/http-boxes-adapter';
import { HttpMinisAdapter } from '../../../infrastructure/http-minis-adapter';
import { HttpPartsAdapter } from '../../../infrastructure/http-parts-adapter';
import { BoxSprueCard } from './box-sprue-card';

const ORKS = 'warhammer-40000/orks';

const BOYZ: Box = {
  id: 'b1',
  name: 'Boyz (2026)',
  kit: { id: 'games-workshop/orks/boyz-2026', version: 1, name: 'Boyz (2026)' },
  factionIds: [ORKS],
  tags: [],
  addedOn: '2026-10-12',
  number: 1,
};

const BOYZ_KIT = {
  id: 'games-workshop/orks/boyz-2026',
  version: 1,
  manufacturer: 'games-workshop',
  name: 'Boyz',
  factionIds: [ORKS],
  releases: [{ year: 2026 }],
  minis: 10,
  isDraft: false,
  contains: [],
  variants: [{ name: 'Boyz', slots: [{ count: 10, buildsAs: ['Boy'], parts: ['Slugga'], factionIds: [] }] }],
};

/** Five alike Boyz on the sprue, one row. */
const ON_THE_SPRUE: Mini[] = ['m1', 'm2', 'm3', 'm4', 'm5'].map((id) => ({
  id,
  name: 'Boy',
  sprueName: 'Boy',
  factionIds: [ORKS],
  status: 'sprue',
  parts: [],
  boxId: BOYZ.id,
  isOnWorkbench: false,
}));

const ROW: MiniRow = {
  id: 'm1',
  name: 'Boy',
  factions: ['Orks'],
  box: BOYZ.name,
  boxId: BOYZ.id,
  parts: [],
  status: 'sprue',
  isOnWorkbench: false,
  count: 5,
};

describe('Card on the sprue', () => {
  let fixture: ComponentFixture<BoxSprueCard>;
  let update: ReturnType<typeof vi.fn>;

  /** The card opens and closes its panels as the box page would. */
  async function showCard(saves: () => Promise<readonly Mini[]> = () => Promise.resolve([])): Promise<void> {
    update = vi.fn(saves);
    TestBed.configureTestingModule({
      providers: [
        {
          provide: HttpBoxesAdapter,
          useValue: { list: vi.fn(async () => ({ boxes: [BOYZ], factionNames: new Map() })) },
        },
        {
          provide: HttpMinisAdapter,
          useValue: {
            list: vi.fn(async () => ({
              minis: ON_THE_SPRUE,
              factionNames: new Map([[ORKS, 'Orks']]),
              systemNames: new Map(),
            })),
            update,
          },
        },
        { provide: HttpPartsAdapter, useValue: { list: vi.fn(async () => []) } },
        {
          provide: HttpKitsAdapter,
          useValue: {
            find: vi.fn(async () => ({
              kits: [BOYZ_KIT],
              containedKits: new Map(),
              factionNames: new Map(),
            })),
          },
        },
        { provide: HttpCatalogPartsAdapter, useValue: { rangeParts: vi.fn(async () => []) } },
      ],
    });
    fixture = TestBed.createComponent(BoxSprueCard);
    fixture.componentRef.setInput('row', ROW);
    fixture.componentInstance.panelChange.subscribe((panel) => fixture.componentRef.setInput('panel', panel));
    await fixture.whenStable();
  }

  const all = (testId: string): HTMLElement[] => [
    ...(fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>(`[data-testid="${testId}"]`),
  ];

  async function click(element: HTMLElement | undefined): Promise<void> {
    element?.click();
    await fixture.whenStable();
  }

  async function buildTwoBoyz(): Promise<void> {
    await click(all('box-sprue-toggle')[0]);
    await click(all('mini-build-as')[0]);
    await click(all('mini-build-more')[0]);
    await click(all('mini-build')[0]);
  }

  it('tells screen readers how many minis the row stands for', async () => {
    await showCard();

    expect(all('box-sprue-toggle')[0]?.querySelector('[aria-label$=" minis"]')?.getAttribute('aria-label')).toBe(
      '5 minis',
    );
  });

  it('shows the build panel only once the card is opened', async () => {
    await showCard();
    const toggle = all('box-sprue-toggle')[0];
    const closed = [all('box-sprue-panel').length, toggle?.getAttribute('aria-expanded')];

    await click(toggle);

    expect([closed, [all('box-sprue-panel').length, toggle?.getAttribute('aria-expanded')]]).toEqual([
      [0, 'false'],
      [1, 'true'],
    ]);
  });

  it('builds as many minis of the row as chosen with what was chosen', async () => {
    await showCard();

    await buildTwoBoyz();

    expect(update).toHaveBeenCalledWith(
      ['m1', 'm2'],
      expect.objectContaining({
        name: 'Boy',
        status: 'built',
        parts: [{ name: 'Slugga', isSwappable: false }],
        isOnWorkbench: true,
      }),
    );
  });

  it("says that the minis can't be built when the server does not answer", async () => {
    await showCard(() => Promise.reject(new Error('offline')));

    await buildTwoBoyz();

    expect(all('box-sprue-panel')).toHaveLength(1);
    expect(all('mini-save-error')).toHaveLength(1);
  });
});
