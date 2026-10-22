import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FilterChip, type FilterOption } from './filter-chip';

const STATUSES: FilterOption[] = [
  { value: 'sprue', label: 'On the sprue', count: 28 },
  { value: 'built', label: 'Built', count: 3 },
  { value: 'primed', label: 'Primed', count: 6 },
];

describe('Filter chip', () => {
  let fixture: ComponentFixture<FilterChip>;
  let chip: HTMLElement;
  let reported: ReadonlySet<string>[];

  beforeEach(async () => {
    reported = [];
    fixture = TestBed.createComponent(FilterChip);
    fixture.componentRef.setInput('label', 'Status');
    fixture.componentRef.setInput('options', STATUSES);
    fixture.componentInstance.selectedChange.subscribe((selected) => reported.push(selected));
    chip = fixture.nativeElement;
    await fixture.whenStable();
  });

  /** The visible words of an element; templates drop the spaces between elements. */
  const wordsOf = (element: Element): string => {
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    const texts: string[] = [];
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const text = node.textContent?.trim();
      if (text) {
        texts.push(text);
      }
    }
    return texts.join(' ');
  };

  // The list opens in an overlay outside the chip.
  const optionTexts = (): string[] =>
    Array.from(document.querySelectorAll('[data-testid="hoard-filter-option"]')).map(wordsOf);

  const open = async (): Promise<void> => {
    chip.querySelector<HTMLButtonElement>('button')?.click();
    await fixture.whenStable();
  };

  const select = async (values: string[]): Promise<void> => {
    fixture.componentRef.setInput('selected', new Set(values));
    await fixture.whenStable();
  };

  it('lists every value with the number of its minis when opened', async () => {
    await open();

    expect(optionTexts()).toEqual(['On the sprue 28', 'Built 3', 'Primed 6']);
  });

  it('narrows the list to the values that contain the typed text', async () => {
    await open();
    const search = document.querySelector<HTMLInputElement>('input[aria-label="Search Status"]');

    if (search) {
      search.value = 'pri';
      search.dispatchEvent(new Event('input'));
    }
    await fixture.whenStable();

    expect(optionTexts()).toEqual(['Primed 6']);
  });

  it('names up to two ticked values on the chip and counts more', async () => {
    await select(['built', 'primed']);
    const twoTicked = wordsOf(chip);
    await select(['sprue', 'built', 'primed']);

    expect(twoTicked).toBe('Status Built Primed');
    expect(wordsOf(chip)).toBe('Status 3 selected');
  });

  it('clears its values with "Clear filter"', async () => {
    await select(['built']);
    await open();

    Array.from(document.querySelectorAll<HTMLButtonElement>('button'))
      .find((button) => button.textContent?.trim() === 'Clear filter')
      ?.click();

    expect(reported).toEqual([new Set()]);
  });
});
