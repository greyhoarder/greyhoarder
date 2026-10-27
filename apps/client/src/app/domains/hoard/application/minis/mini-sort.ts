import { hobbyStatuses } from '@greyhoarder/domain/hoard';
import type { SortDirection } from '../../util/sort-direction';
import type { MiniRow } from './mini-row';

export const miniSortOrders = ['name', 'army', 'box', 'status'] as const;

export type MiniSortOrder = (typeof miniSortOrders)[number];

/** Rows without a box sort after those with one. */
const byOptionalText = (a: string | undefined, b: string | undefined): number =>
  (a ?? '￿').localeCompare(b ?? '￿');

const COMPARERS: Record<MiniSortOrder, (a: MiniRow, b: MiniRow) => number> = {
  name: (a, b) => a.name.localeCompare(b.name),
  army: (a, b) => a.factions.join().localeCompare(b.factions.join()),
  box: (a, b) => byOptionalText(a.box, b.box),
  status: (a, b) => hobbyStatuses.indexOf(a.status) - hobbyStatuses.indexOf(b.status),
};

/** A sorted copy; rows that compare equal keep their order in both directions. */
export function sortRows(
  rows: readonly MiniRow[],
  order: MiniSortOrder,
  direction: SortDirection,
): MiniRow[] {
  const sign = direction === 'ascending' ? 1 : -1;
  return [...rows].sort((a, b) => sign * COMPARERS[order](a, b));
}
