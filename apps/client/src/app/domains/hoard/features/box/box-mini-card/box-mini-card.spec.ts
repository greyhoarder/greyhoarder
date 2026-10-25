import { TestBed } from '@angular/core/testing';
import type { MiniRow } from '../../../data/mini-row';
import { BoxMiniCard } from './box-mini-card';

const NOB: MiniRow = {
  id: '1',
  name: 'Boss Nob',
  factions: ['Orks'],
  box: 'Boyz (2026)',
  parts: ['Power Klaw', 'Boss Pole'],
  status: 'painted',
  isOnWorkbench: true,
  count: 1,
};

describe('Mini card of a box', () => {
  const render = async (row: MiniRow): Promise<HTMLElement> => {
    const fixture = TestBed.createComponent(BoxMiniCard);
    fixture.componentRef.setInput('row', row);
    fixture.componentRef.setInput('boxFactions', ['Orks']);
    await fixture.whenStable();
    return fixture.nativeElement;
  };

  it('shows the parts of the minis', async () => {
    const card = await render(NOB);

    expect(card.textContent).toContain('Power Klaw · Boss Pole');
  });

  it('marks minis that are on the workbench', async () => {
    const cards = [await render(NOB), await render({ ...NOB, isOnWorkbench: false })];

    expect(cards.map((card) => card.textContent?.includes('Workbench'))).toEqual([true, false]);
  });

  it('names the status of the minis', async () => {
    const card = await render(NOB);

    expect(card.querySelector('[data-testid="hoard-status"]')?.textContent?.trim()).toBe('Painted');
  });
});
