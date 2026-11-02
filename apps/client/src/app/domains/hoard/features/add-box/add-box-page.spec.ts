import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HttpKitsAdapter, type KitSearchResult, type VersionedCatalogKit } from '../../../catalog/api';
import { HttpBoxesAdapter } from '../../infrastructure/http-boxes-adapter';
import { HttpMinisAdapter } from '../../infrastructure/http-minis-adapter';
import { AddBoxPage } from './add-box-page';

/** Boyz with one slot of ten Boyz. */
function boyzKit(): VersionedCatalogKit {
  return {
    ...catalogKit('games-workshop/orks/boyz-2026'),
    variants: [{ name: 'Boyz', slots: [{ count: 10, buildsAs: ['Boy'], parts: [], factionIds: [] }] }],
  };
}

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
          useValue: { list: vi.fn(async () => ({ minis: [], factionNames: new Map(), systemNames: new Map() })) },
        },
      ],
    });
    fixture = TestBed.createComponent(AddBoxPage);
    await fixture.whenStable();
  });

  const page = (): HTMLElement => fixture.nativeElement;
  const kits = (): NodeListOf<Element> => page().querySelectorAll('[data-testid="add-box-kit"]');
  const byTestId = (id: string): Element | null => page().querySelector(`[data-testid="${id}"]`);

  const allText = (id: string): string[] =>
    [...page().querySelectorAll(`[data-testid="${id}"]`)].map((element) => (element.textContent ?? '').trim());

  async function click(id: string): Promise<void> {
    (byTestId(id) as HTMLElement).click();
    await fixture.whenStable();
  }

  async function openForSprues(): Promise<void> {
    fixture.componentRef.setInput('areSprues', true);
    await fixture.whenStable();
  }

  /** Opens the card of the Boyz kit found for "boyz". */
  async function openBoyz(): Promise<void> {
    search.mockResolvedValue({ kits: [boyzKit()], containedKits: new Map(), factionNames: new Map() });
    await searchFor('boyz');
    await click('add-box-kit');
  }

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
          variants: [{ name: 'Boyz', slots: [{ count: 10, buildsAs: ['Boy'], parts: [], factionIds: [] }] }],
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

  it('says "Add sprues" and how to search for sprues when opened for sprues', async () => {
    await openForSprues();

    expect(page().querySelector('h1')?.textContent?.trim()).toBe('Add sprues');
    expect(byTestId('add-box-hint')?.textContent?.trim()).toBe(
      'Search the catalog for the kit your sprues come from, by its name or a model on them.',
    );
  });

  it('sends the name and the counted rows of the box when adding', async () => {
    addBoxes.mockResolvedValue({ boxes: [], minis: [] });
    await openBoyz();
    await click('add-box-slot-less');

    await click('add-box-submit');

    expect(addBoxes).toHaveBeenCalledExactlyOnceWith(
      'games-workshop/orks/boyz-2026',
      { boxes: 1, name: 'Boyz', rows: [9], tags: [], areSprues: false },
      expect.any(String),
    );
  });

  it('says which box of sprues was added with how many minis', async () => {
    addBoxes.mockResolvedValue({
      boxes: [{ id: 'box-1', name: 'Boyz sprues', factionIds: [], tags: [], addedOn: '2026-10-31', number: 1 }],
      minis: [{ id: 'mini-1' }, { id: 'mini-2' }, { id: 'mini-3' }],
    });
    await openForSprues();
    await openBoyz();
    await click('add-box-slot-more');
    await click('add-box-slot-more');
    await click('add-box-slot-more');

    await click('add-box-submit');

    expect(byTestId('add-box-added')?.textContent?.replace(/\s+/g, ' ').trim()).toContain(
      'Added Boyz sprues with 3 minis to your hoard.',
    );
  });

  it('moves the focus to the search with its text selected after adding', async () => {
    addBoxes.mockResolvedValue({ boxes: [], minis: [] });
    await openBoyz();

    await click('add-box-submit');

    const field = byTestId('add-box-search') as HTMLInputElement;
    expect(document.activeElement).toBe(field);
    expect([field.selectionStart, field.selectionEnd]).toEqual([0, 'boyz'.length]);
  });

  it("says that the sprues can't be added when the server does not answer, keeping the counted rows", async () => {
    addBoxes.mockRejectedValue(new Error('offline'));
    await openForSprues();
    await openBoyz();
    await click('add-box-slot-more');
    await click('add-box-slot-more');

    await click('add-box-submit');

    expect(byTestId('add-box-add-error')).not.toBeNull();
    expect(allText('add-box-slot-count')).toEqual(['2']);
  });
});
