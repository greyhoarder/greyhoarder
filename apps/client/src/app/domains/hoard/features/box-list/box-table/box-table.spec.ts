import { TestBed } from '@angular/core/testing';
import type { BoxRow } from '../../../application/boxes/box-row';
import { BoxTable } from './box-table';

const BOXES: BoxRow[] = [
  {
    id: '1',
    name: 'Boyz',
    factions: ['Orks'],
    minis: { sprue: 10 },
    addedOn: '2026-10-12',
    number: 1,
    tags: [],
  },
  {
    id: '2',
    name: 'Intercessors',
    factions: ['Space Marines'],
    minis: { sprue: 10 },
    addedOn: '2026-09-30',
    number: 1,
    tags: [],
  },
  {
    id: '3',
    name: 'Gorkanaut',
    factions: ['Orks'],
    minis: { primed: 1 },
    addedOn: '2025-12-24',
    number: 1,
    tags: [],
  },
];

describe('Box table', () => {
  it('toggles the order when the header of the sorted column is clicked', async () => {
    const fixture = TestBed.createComponent(BoxTable);
    fixture.componentRef.setInput('boxes', BOXES);
    await fixture.whenStable();
    const table: HTMLElement = fixture.nativeElement;
    const nameHeader = table.querySelector<HTMLButtonElement>(
      '[data-testid="hoard-box-sort-name"]',
    );
    const firstBox = (): string | undefined =>
      table.querySelector('[data-testid="hoard-box"] .font-medium')?.textContent?.trim();

    nameHeader?.click();
    await fixture.whenStable();
    const ascending = firstBox();
    nameHeader?.click();
    await fixture.whenStable();

    expect(ascending).toBe('Boyz');
    expect(firstBox()).toBe('Intercessors');
  });

  describe('with the check in the header', () => {
    const render = async (selectedIds: string[]) => {
      const fixture = TestBed.createComponent(BoxTable);
      fixture.componentRef.setInput('boxes', BOXES);
      fixture.componentRef.setInput('selectedIds', new Set(selectedIds));
      await fixture.whenStable();
      const allSelectedChange = vi.fn();
      fixture.componentInstance.allSelectedChange.subscribe(allSelectedChange);
      const check = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>(
        '[data-testid="hoard-box-select-all"]',
      );
      return { check, allSelectedChange };
    };

    it('selects every box with the check in the header', async () => {
      const { check, allSelectedChange } = await render(['1']);

      check?.click();

      expect(allSelectedChange).toHaveBeenCalledExactlyOnceWith(true);
    });

    it('selects no box with the check in the header once all are selected', async () => {
      const { check, allSelectedChange } = await render(['1', '2', '3']);

      check?.click();

      expect(allSelectedChange).toHaveBeenCalledExactlyOnceWith(false);
    });
  });
});
