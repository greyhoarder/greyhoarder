import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HttpKitsAdapter, type KitSearchResult, type VersionedCatalogKit } from '../../../catalog/api';
import { HttpBoxesAdapter } from '../../infrastructure/http-boxes-adapter';
import { HttpMinisAdapter } from '../../infrastructure/http-minis-adapter';
import { AddBoxPage } from './add-box-page';

function catalogKit(id: string): VersionedCatalogKit {
  return {
    id,
    version: 1,
    manufacturer: 'games-workshop',
    name: 'Boyz',
    factionIds: ['warhammer-40000/orks'],
    releases: [],
    minis: 10,
    isDraft: false,
    contains: [],
    variants: [],
  };
}

describe('Add box page', () => {
  let fixture: ComponentFixture<AddBoxPage>;
  let search: ReturnType<typeof vi.fn<(text: string) => Promise<KitSearchResult>>>;
  let addBoxes: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    search = vi.fn<(text: string) => Promise<KitSearchResult>>();
    addBoxes = vi.fn();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: HttpKitsAdapter, useValue: { search } },
        {
          provide: HttpBoxesAdapter,
          useValue: {
            list: vi.fn(async () => ({ boxes: [], factionNames: new Map() })),
            add: addBoxes,
          },
        },
        {
          provide: HttpMinisAdapter,
          useValue: { list: vi.fn(async () => ({ minis: [], factionNames: new Map() })) },
        },
      ],
    });
    fixture = TestBed.createComponent(AddBoxPage);
    await fixture.whenStable();
  });

  const page = (): HTMLElement => fixture.nativeElement;
  const kits = (): NodeListOf<Element> => page().querySelectorAll('[data-testid="add-box-kit"]');
  const byTestId = (id: string): Element | null => page().querySelector(`[data-testid="${id}"]`);

  async function searchFor(text: string): Promise<void> {
    const field = page().querySelector<HTMLInputElement>('[data-testid="add-box-search"]');
    if (field) {
      field.value = text;
      field.dispatchEvent(new Event('input'));
    }
    await fixture.whenStable();
  }

  it('says to search by name, product code or barcode while the search is empty', () => {
    expect(byTestId('add-box-hint')).not.toBeNull();
    expect(kits()).toHaveLength(0);
  });

  it('shows the catalog kits found for the search', async () => {
    search.mockResolvedValue({
      kits: [catalogKit('games-workshop/orks/boyz-2021'), catalogKit('games-workshop/orks/boyz-2026')],
      containedKits: new Map(),
      factionNames: new Map([['warhammer-40000/orks', 'Orks']]),
    });

    await searchFor('boyz');

    expect(kits()).toHaveLength(2);
  });

  it('says that no kit matches when the catalog finds none', async () => {
    search.mockResolvedValue({ kits: [], containedKits: new Map(), factionNames: new Map() });

    await searchFor('grots');

    expect(byTestId('add-box-no-results')?.textContent?.trim()).toBe('No kits match "grots".');
  });

  it("says that the catalog can't be searched when the request fails", async () => {
    search.mockRejectedValue(new Error('offline'));

    await searchFor('boyz');

    expect(byTestId('add-box-error')).not.toBeNull();
  });

  it("says that the boxes can't be added when the server does not answer", async () => {
    search.mockResolvedValue({
      kits: [
        {
          ...catalogKit('games-workshop/orks/boyz-2026'),
          variants: [
            { name: 'Boyz', slots: [{ count: 10, buildsAs: ['Boy'], parts: [], factionIds: [] }] },
          ],
        },
      ],
      containedKits: new Map(),
      factionNames: new Map(),
    });
    addBoxes.mockRejectedValue(new Error('offline'));
    await searchFor('boyz');
    (byTestId('add-box-kit') as HTMLElement).click();
    await fixture.whenStable();

    (byTestId('add-box-submit') as HTMLElement).click();
    await fixture.whenStable();

    expect(byTestId('add-box-add-error')).not.toBeNull();
    expect(byTestId('add-box-submit')).not.toBeNull();
  });
});
