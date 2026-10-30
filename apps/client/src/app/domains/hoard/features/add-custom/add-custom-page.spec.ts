import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HttpCatalogFactionsAdapter, HttpCatalogMinisAdapter, HttpCatalogPartsAdapter } from '../../../catalog/api';
import { HttpMinisAdapter } from '../../infrastructure/http-minis-adapter';
import { HttpPartsAdapter } from '../../infrastructure/http-parts-adapter';
import { AddCustomPage } from './add-custom-page';

describe('Add custom page', () => {
  let fixture: ComponentFixture<AddCustomPage>;
  let addMinis: ReturnType<typeof vi.fn<HttpMinisAdapter['add']>>;

  beforeEach(async () => {
    addMinis = vi.fn<HttpMinisAdapter['add']>(async () => []);
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: HttpMinisAdapter,
          useValue: {
            list: vi.fn(async () => ({
              minis: [],
              factionNames: new Map(),
              systemNames: new Map(),
            })),
            add: addMinis,
          },
        },
        { provide: HttpPartsAdapter, useValue: { list: vi.fn(async () => []) } },
        {
          provide: HttpCatalogMinisAdapter,
          useValue: {
            search: vi.fn(async () => ({
              minis: [],
              factionNames: new Map(),
              systemNames: new Map(),
            })),
          },
        },
        { provide: HttpCatalogFactionsAdapter, useValue: { search: vi.fn(async () => []) } },
        { provide: HttpCatalogPartsAdapter, useValue: { rangeParts: vi.fn(async () => []) } },
      ],
    });
    fixture = TestBed.createComponent(AddCustomPage);
    await fixture.whenStable();
  });

  const byTestId = <T extends HTMLElement = HTMLElement>(testId: string): T[] =>
    Array.from((fixture.nativeElement as HTMLElement).querySelectorAll<T>(`[data-testid="${testId}"]`));

  const typeName = async (name: string): Promise<void> => {
    const field = byTestId<HTMLInputElement>('add-custom-name')[0];
    field.value = name;
    field.dispatchEvent(new Event('input'));
    await fixture.whenStable();
  };

  const click = async (testId: string, index = 0): Promise<void> => {
    byTestId(testId)[index]?.click();
    await fixture.whenStable();
  };

  /** Two primed Tankbustas, added. */
  const addTwoPrimedTankbustas = async (): Promise<void> => {
    await typeName('Tankbusta');
    const primed = byTestId('add-custom-status').findIndex((chip) => chip.textContent?.trim() === 'Primed');
    await click('add-custom-status', primed);
    await click('add-custom-more');
    await click('add-custom-submit');
  };

  it('asks for a name and adds nothing when the name is empty', async () => {
    await click('add-custom-submit');

    expect(byTestId('add-custom-name-missing')[0]?.textContent?.trim()).toBe('Give the minis a name.');
    expect(addMinis).not.toHaveBeenCalled();
  });

  it('adds as many minis as counted, without a box', async () => {
    await addTwoPrimedTankbustas();

    expect(addMinis).toHaveBeenCalledExactlyOnceWith({
      name: 'Tankbusta',
      factions: [],
      status: 'primed',
      parts: [],
      count: 2,
    });
  });

  it("adds the minis with a new faction of the user's own", async () => {
    await typeName('Tankbusta');
    await click('add-custom-add-faction');
    // The search opens in a popover outside the page.
    const field = document.querySelector<HTMLInputElement>('[data-testid="add-custom-faction-search"]');
    if (field) {
      field.value = 'Crimson Wolves';
      field.dispatchEvent(new Event('input'));
    }
    await fixture.whenStable();
    document.querySelector<HTMLElement>('[data-testid="add-custom-faction-create"]')?.click();
    await fixture.whenStable();

    await click('add-custom-submit');

    expect(addMinis).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ factions: [{ name: 'Crimson Wolves' }] }),
    );
  });

  it('says which minis were added', async () => {
    await addTwoPrimedTankbustas();

    expect(byTestId('add-custom-added')[0]?.textContent).toContain('Added 2 × Tankbusta (Primed) to your hoard.');
  });

  it('says that adding failed when the server does not add the minis', async () => {
    addMinis.mockRejectedValue(new Error('offline'));
    await typeName('Tankbusta');

    await click('add-custom-submit');

    expect(byTestId('add-custom-add-error')[0]?.textContent?.trim()).toBe(
      "Can't add the minis right now. Try again in a moment.",
    );
  });
});
