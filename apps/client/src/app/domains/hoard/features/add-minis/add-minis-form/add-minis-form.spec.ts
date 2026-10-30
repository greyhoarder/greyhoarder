import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpCatalogPartsAdapter } from '../../../../catalog/api';
import { MinisAddition } from '../../../application/minis/minis-addition';
import { HttpMinisAdapter } from '../../../infrastructure/http-minis-adapter';
import { HttpPartsAdapter } from '../../../infrastructure/http-parts-adapter';
import { AddMinisForm } from './add-minis-form';

describe('Add minis form', () => {
  let fixture: ComponentFixture<AddMinisForm>;
  let addMinis: ReturnType<typeof vi.fn<HttpMinisAdapter['add']>>;

  /** The form of the opened card of the Boy of the Orks. */
  beforeEach(async () => {
    addMinis = vi.fn<HttpMinisAdapter['add']>(async () => []);
    TestBed.configureTestingModule({
      providers: [
        MinisAddition,
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
        { provide: HttpCatalogPartsAdapter, useValue: { rangeParts: vi.fn(async () => []) } },
      ],
    });
    TestBed.inject(MinisAddition).start({
      name: 'Boy',
      faction: { id: 'warhammer-40000/orks', name: 'Orks' },
    });
    fixture = TestBed.createComponent(AddMinisForm);
    fixture.componentRef.setInput('kit', 'Boyz · 2026');
    await fixture.whenStable();
  });

  const byTestId = (testId: string): HTMLElement[] =>
    Array.from((fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>(`[data-testid="${testId}"]`));

  const click = async (testId: string, index = 0): Promise<void> => {
    byTestId(testId)[index]?.click();
    await fixture.whenStable();
  };

  it('offers every status, also on the sprue', () => {
    expect(byTestId('add-minis-status').map((chip) => chip.textContent?.trim())).toEqual([
      'On the sprue',
      'Built',
      'Primed',
      'Painted',
      'Done',
    ]);
  });

  it('adds as many minis of the mini as counted', async () => {
    await click('add-minis-status', 0);
    await click('add-minis-more');
    await click('add-minis-more');

    await click('add-minis-submit');

    expect(addMinis).toHaveBeenCalledExactlyOnceWith({
      name: 'Boy',
      factions: [{ id: 'warhammer-40000/orks' }],
      status: 'sprue',
      parts: [],
      count: 3,
    });
  });
});
