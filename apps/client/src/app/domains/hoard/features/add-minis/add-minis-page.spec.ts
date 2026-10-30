import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import {
  type CatalogMini,
  type CatalogMiniSearchResult,
  HttpCatalogMinisAdapter,
  HttpCatalogPartsAdapter,
} from '../../../catalog/api';
import { HttpMinisAdapter } from '../../infrastructure/http-minis-adapter';
import { HttpPartsAdapter } from '../../infrastructure/http-parts-adapter';
import { AddMinisPage } from './add-minis-page';

const catalogMini = (name: string): CatalogMini => ({
  name,
  factionId: 'warhammer-40000/orks',
  parts: [],
  kit: { id: 'boyz-2026', version: 1, name: 'Boyz', year: 2026, isDraft: false },
});

const found = (minis: readonly CatalogMini[]): CatalogMiniSearchResult => ({
  minis,
  factionNames: new Map([['warhammer-40000/orks', 'Orks']]),
  systemNames: new Map([['warhammer-40000/orks', 'Warhammer 40,000']]),
});

describe('Add minis page', () => {
  let fixture: ComponentFixture<AddMinisPage>;
  let search: ReturnType<typeof vi.fn<HttpCatalogMinisAdapter['search']>>;

  beforeEach(async () => {
    search = vi.fn<HttpCatalogMinisAdapter['search']>(async () => found([]));
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: HttpCatalogMinisAdapter, useValue: { search } },
        { provide: HttpCatalogPartsAdapter, useValue: { rangeParts: vi.fn(async () => []) } },
        {
          provide: HttpMinisAdapter,
          useValue: {
            list: vi.fn(async () => ({
              minis: [],
              factionNames: new Map(),
              systemNames: new Map(),
            })),
          },
        },
        { provide: HttpPartsAdapter, useValue: { list: vi.fn(async () => []) } },
      ],
    });
    fixture = TestBed.createComponent(AddMinisPage);
    await fixture.whenStable();
  });

  const byTestId = (testId: string): HTMLElement[] =>
    Array.from((fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>(`[data-testid="${testId}"]`));

  const searchFor = async (text: string): Promise<void> => {
    const field = byTestId('add-minis-search')[0] as HTMLInputElement;
    field.value = text;
    field.dispatchEvent(new Event('input'));
    await fixture.whenStable();
  };

  it('says what to search for while the search is empty', () => {
    expect(byTestId('add-minis-hint')[0]?.textContent?.trim()).toBe(
      'Search the catalog for a mini by its name, the kit it comes in or its faction.',
    );
  });

  it('shows the catalog minis found for the search', async () => {
    search.mockResolvedValue(found([catalogMini('Boy'), catalogMini('Burna Boy')]));

    await searchFor('boy');

    expect(byTestId('add-minis-mini-name').map((name) => name.textContent?.trim())).toEqual(['Boy', 'Burna Boy']);
  });

  it('says that nothing matches when the search finds no minis', async () => {
    await searchFor('xyz');

    expect(byTestId('add-minis-no-results')[0]?.textContent?.trim()).toBe('No minis match "xyz".');
  });

  it('keeps only one card open at a time', async () => {
    search.mockResolvedValue(found([catalogMini('Boy'), catalogMini('Burna Boy')]));
    await searchFor('boy');

    byTestId('add-minis-mini')[0]?.click();
    await fixture.whenStable();
    byTestId('add-minis-mini')[1]?.click();
    await fixture.whenStable();

    expect(byTestId('add-minis-mini').map((card) => card.getAttribute('aria-expanded'))).toEqual(['false', 'true']);
  });
});
