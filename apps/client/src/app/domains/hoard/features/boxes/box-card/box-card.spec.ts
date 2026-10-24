import { TestBed } from '@angular/core/testing';
import type { BoxRow } from '../../../models/box-row';
import { BoxCard } from './box-card';

const BOYZ: BoxRow = {
  id: '1',
  name: 'Boyz (2026)',
  kit: { name: 'Boyz (2026)', sku: '50-80' },
  factions: ['Orks'],
  minis: { sprue: 7, built: 3 },
  addedOn: '2026-10-12',
  tags: [],
};

describe('Box card', () => {
  const render = async (box: BoxRow): Promise<HTMLElement> => {
    const fixture = TestBed.createComponent(BoxCard);
    fixture.componentRef.setInput('box', box);
    await fixture.whenStable();
    return fixture.nativeElement;
  };

  it('shows how far the box has come as a percentage', async () => {
    const card = await render(BOYZ);

    expect(
      card.querySelector('[data-testid="hoard-box-percent"]')?.textContent?.replace(/\s+/g, ''),
    ).toBe('8%');
  });

  it('names the kit with its article number', async () => {
    const card = await render(BOYZ);

    expect(card.textContent).toContain('Boyz (2026) · 50-80');
  });
});
