import { TestBed } from '@angular/core/testing';
import type { BoxRow } from '../../../application/boxes/box-row';
import { BoxCard } from './box-card';

const BOYZ: BoxRow = {
  id: '1',
  name: 'Boyz (2026)',
  kit: { name: 'Boyz (2026)', sku: '50-80' },
  factions: ['Orks'],
  minis: { sprue: 7, built: 3 },
  addedOn: '2026-10-12',
  number: 1,
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

    expect(card.querySelector('[data-testid="hoard-box-percent"]')?.textContent?.replace(/\s+/g, '')).toBe('8%');
  });

  it('names the kit with its article number', async () => {
    const card = await render(BOYZ);

    expect(card.textContent).toContain('Boyz (2026) · 50-80');
  });

  it('names a box without any minis empty', async () => {
    const card = await render({ ...BOYZ, minis: {}, goneCount: 0 });

    expect(card.querySelector('[data-testid="hoard-box-progress"]')?.textContent?.trim()).toBe('Empty');
    expect(card.querySelector('[data-testid="hoard-box-percent"]')).toBeNull();
  });

  it('shows the number of the box', async () => {
    const card = await render({ ...BOYZ, number: 2 });

    expect(card.querySelector('[data-testid="hoard-box-number"]')?.textContent?.trim()).toBe('#2');
  });
});
