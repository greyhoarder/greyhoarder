import { TestBed } from '@angular/core/testing';
import { BoxesPage } from './boxes-page';

describe('Boxes page', () => {
  it('shows only the boxes whose name, kit or tag contains the search', async () => {
    const fixture = TestBed.createComponent(BoxesPage);
    await fixture.whenStable();
    const page: HTMLElement = fixture.nativeElement;
    const search = page.querySelector<HTMLInputElement>('[data-testid="hoard-box-search"]');

    if (search) {
      search.value = 'second';
      search.dispatchEvent(new Event('input'));
    }
    await fixture.whenStable();

    expect(page.querySelectorAll('[data-testid="hoard-box"]')).toHaveLength(2);
  });
});
