import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MinisPage } from './minis-page';

describe('Minis page', () => {
  let fixture: ComponentFixture<MinisPage>;
  let page: HTMLElement;

  beforeEach(async () => {
    fixture = TestBed.createComponent(MinisPage);
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

  it('shows only the rows with a matching part while searching', async () => {
    await search('klaw');

    expect(byTestId('hoard-row')).toHaveLength(1);
  });

  it('says that nothing matches when the search finds no minis', async () => {
    await search('grot tank');

    expect(byTestId('hoard-row')).toHaveLength(0);
    expect(textOf('hoard-no-results')).toBe('No minis match "grot tank".');
  });
});
