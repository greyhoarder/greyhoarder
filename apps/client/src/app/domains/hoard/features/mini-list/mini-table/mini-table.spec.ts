import { TestBed } from '@angular/core/testing';
import type { MiniRow } from '../../../application/minis/mini-row';
import { MiniTable } from './mini-table';

const ROWS: MiniRow[] = [
  {
    id: '1',
    name: 'Boy',
    factions: ['Orks'],
    box: 'Boyz',
    parts: [],
    status: 'built',
    isOnWorkbench: false,
    count: 2,
  },
  {
    id: '2',
    name: 'Nob',
    factions: ['Orks'],
    box: 'Boyz',
    parts: [],
    status: 'sprue',
    isOnWorkbench: false,
    count: 1,
  },
  {
    id: '3',
    name: 'Captain',
    factions: ['Dark Angels'],
    parts: [],
    status: 'done',
    isOnWorkbench: false,
    count: 1,
  },
];

describe('Mini table', () => {
  it('toggles the order when the header of the sorted column is clicked', async () => {
    const fixture = TestBed.createComponent(MiniTable);
    fixture.componentRef.setInput('rows', ROWS);
    await fixture.whenStable();
    const table: HTMLElement = fixture.nativeElement;
    const statusHeader = table.querySelector<HTMLButtonElement>(
      '[data-testid="hoard-sort-status"]',
    );
    const firstStatus = (): string | undefined =>
      table.querySelector('[data-testid="hoard-status"]')?.textContent?.trim();

    statusHeader?.click();
    await fixture.whenStable();
    const ascending = firstStatus();
    statusHeader?.click();
    await fixture.whenStable();

    expect(ascending).toBe('On the sprue');
    expect(firstStatus()).toBe('Done');
  });

  describe('with the check in the header', () => {
    const render = async (selectedIds: string[]) => {
      const fixture = TestBed.createComponent(MiniTable);
      fixture.componentRef.setInput('rows', ROWS);
      fixture.componentRef.setInput('selectedIds', new Set(selectedIds));
      await fixture.whenStable();
      const allSelectedChange = vi.fn();
      fixture.componentInstance.allSelectedChange.subscribe(allSelectedChange);
      const check = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>(
        '[data-testid="hoard-select-all"]',
      );
      return { check, allSelectedChange };
    };

    it('selects every mini with the check in the header', async () => {
      const { check, allSelectedChange } = await render(['1']);

      check?.click();

      expect(allSelectedChange).toHaveBeenCalledExactlyOnceWith(true);
    });

    it('selects no mini with the check in the header once all are selected', async () => {
      const { check, allSelectedChange } = await render(['1', '2', '3']);

      check?.click();

      expect(allSelectedChange).toHaveBeenCalledExactlyOnceWith(false);
    });
  });
});
