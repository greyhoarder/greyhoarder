import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import type { CatalogKit } from '@greyhoarder/domain/catalog';
import { HttpKitsAdapter, type KitSearchResult } from '../../../catalog/api';
import { AddBoxPage } from './add-box-page';

function catalogKit(id: string): CatalogKit {
  return {
    id,
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

  beforeEach(async () => {
    search = vi.fn<(text: string) => Promise<KitSearchResult>>();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: HttpKitsAdapter, useValue: { search } }],
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

  it('asks for a name, product code or barcode while the search is empty', () => {
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
});
