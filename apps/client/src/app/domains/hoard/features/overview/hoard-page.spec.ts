import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HoardPage } from './hoard-page';

describe('Hoard page', () => {
  let fixture: ComponentFixture<HoardPage>;
  let page: HTMLElement;

  beforeEach(async () => {
    fixture = TestBed.createComponent(HoardPage);
    page = fixture.nativeElement;
    await fixture.whenStable();
  });

  const byTestId = (testId: string): HTMLElement[] =>
    Array.from(page.querySelectorAll<HTMLElement>(`[data-testid="${testId}"]`));

  const textOf = (testId: string): string => byTestId(testId)[0]?.textContent?.trim() ?? '';

  const search = async (query: string): Promise<void> => {
    const field = byTestId('hoard-search')[0] as HTMLInputElement;
    field.value = query;
    field.dispatchEvent(new Event('input'));
    await fixture.whenStable();
  };

  it('sums up the minis, boxes and painted minis of the hoard', () => {
    expect(textOf('hoard-summary')).toBe('46 minis from 5 boxes · 9 painted');
  });

  it('shows only the rows with a matching part while searching and counts them on the tab', async () => {
    await search('klaw');

    expect(byTestId('hoard-row')).toHaveLength(1);
    expect(textOf('hoard-tab-minis-count')).toBe('1 of 46');
  });

  it('says that nothing matches when the search finds no minis', async () => {
    await search('grot tank');

    expect(byTestId('hoard-row')).toHaveLength(0);
    expect(textOf('hoard-no-results')).toBe('No minis match "grot tank".');
  });
});
