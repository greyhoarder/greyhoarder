import { TestBed } from '@angular/core/testing';
import type { MiniRow } from '../../../models/mini-row';
import { MiniCard } from './mini-card';

const SERGEANT: MiniRow = {
  id: '1',
  name: 'Intercessor Sergeant',
  factions: ['Dark Angels'],
  box: 'Intercessors',
  parts: ['Bolt Rifle', 'Power Sword'],
  status: 'primed',
  isOnWorkbench: true,
  count: 1,
};

describe('Mini card', () => {
  const render = async (row: MiniRow): Promise<HTMLElement> => {
    const fixture = TestBed.createComponent(MiniCard);
    fixture.componentRef.setInput('row', row);
    await fixture.whenStable();
    return fixture.nativeElement;
  };

  it('lists the parts of the minis', async () => {
    const row = await render(SERGEANT);

    expect(row.textContent).toContain('Bolt Rifle, Power Sword');
  });

  it('list minis with their status tag', async () => {
    const row = await render(SERGEANT);

    expect(row.querySelector('[data-testid="hoard-status"]')?.textContent?.trim()).toBe('Primed');
  });
});
