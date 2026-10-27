import { type ComponentFixture, TestBed } from '@angular/core/testing';
import type { MiniRow } from '../../../application/minis/mini-row';
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
  let fixture: ComponentFixture<MiniCard>;

  const render = async (row: MiniRow, isSelectionMode = false): Promise<HTMLElement> => {
    fixture = TestBed.createComponent(MiniCard);
    fixture.componentRef.setInput('row', row);
    fixture.componentRef.setInput('isSelectionMode', isSelectionMode);
    await fixture.whenStable();
    return fixture.nativeElement;
  };

  it('list minis with their status tag', async () => {
    const row = await render(SERGEANT);

    expect(row.querySelector('[data-testid="hoard-status"]')?.textContent?.trim()).toBe('Primed');
  });

  it('shows the box of the mini, or that it has none', async () => {
    const rows = [await render(SERGEANT), await render({ ...SERGEANT, box: undefined })];

    expect(rows.map((row) => row.textContent)).toEqual([
      expect.stringContaining('Intercessors'),
      expect.stringContaining('Without box'),
    ]);
  });

  it('opens the mini with a click outside selection mode', async () => {
    const row = await render(SERGEANT);
    const opened = vi.fn();
    fixture.componentInstance.opened.subscribe(opened);

    row.click();

    expect(opened).toHaveBeenCalled();
  });

  it('selects the mini with a click in selection mode', async () => {
    const row = await render(SERGEANT, true);
    const opened = vi.fn();
    const selected = vi.fn();
    fixture.componentInstance.opened.subscribe(opened);
    fixture.componentInstance.selectedChange.subscribe(selected);

    row.click();

    expect(selected).toHaveBeenCalledWith(true);
    expect(opened).not.toHaveBeenCalled();
  });
});
