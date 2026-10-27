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
});
