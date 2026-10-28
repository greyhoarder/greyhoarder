import { TestBed } from '@angular/core/testing';
import type { CatalogMini } from '../../../../catalog/api';
import { CatalogMiniCard } from './catalog-mini-card';

const BOY: CatalogMini = {
  name: 'Boy',
  factionId: 'warhammer-40000/orks',
  parts: [],
  kits: [{ id: 'boyz-2026', name: 'Boyz', year: 2026, isDraft: false }],
};

describe('Catalog mini card', () => {
  const render = async (owned: number) => {
    const fixture = TestBed.createComponent(CatalogMiniCard);
    fixture.componentRef.setInput('mini', BOY);
    fixture.componentRef.setInput('faction', 'Orks · Warhammer 40,000');
    fixture.componentRef.setInput('kits', 'Boyz · 2026');
    fixture.componentRef.setInput('owned', owned);
    fixture.componentRef.setInput('formId', 'add-minis-form');
    await fixture.whenStable();
    const find = (testId: string): HTMLElement | null =>
      (fixture.nativeElement as HTMLElement).querySelector(`[data-testid="${testId}"]`);
    return { fixture, find };
  };

  it('says how many of the mini are in the hoard', async () => {
    const twenty = await render(20);
    const none = await render(0);

    expect(twenty.find('add-minis-mini-owned')?.textContent?.trim()).toBe('20 in your hoard');
    expect(none.find('add-minis-mini-owned')).toBeNull();
  });

  it('opens with a click on it', async () => {
    const { fixture, find } = await render(0);
    const toggled = vi.fn();
    fixture.componentInstance.toggled.subscribe(toggled);

    find('add-minis-mini')?.click();

    expect(toggled).toHaveBeenCalledOnce();
  });
});
