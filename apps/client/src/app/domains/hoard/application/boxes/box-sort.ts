import { boxProgresses } from '../../models/box-progress';
import { paintedCount, progressOf, sprueCount } from './box-row';
import type { BoxRow } from './box-row';
import type { SortDirection } from '../../util/sort-direction';

export const boxSortOrders = ['name', 'faction', 'progress', 'sprue', 'painted', 'added'] as const;

export type BoxSortOrder = (typeof boxSortOrders)[number];

const COMPARERS: Record<BoxSortOrder, (a: BoxRow, b: BoxRow) => number> = {
  name: (a, b) => a.name.localeCompare(b.name) || a.number - b.number,
  faction: (a, b) => a.factions.join().localeCompare(b.factions.join()),
  progress: (a, b) => boxProgresses.indexOf(progressOf(a)) - boxProgresses.indexOf(progressOf(b)),
  sprue: (a, b) => sprueCount(a) - sprueCount(b),
  painted: (a, b) => paintedCount(a) - paintedCount(b),
  added: (a, b) => a.addedOn.localeCompare(b.addedOn),
};

/** A sorted copy; boxes that compare equal keep their order in both directions. */
export function sortBoxes(
  boxes: readonly BoxRow[],
  order: BoxSortOrder,
  direction: SortDirection,
): BoxRow[] {
  const sign = direction === 'ascending' ? 1 : -1;
  return [...boxes].sort((a, b) => sign * COMPARERS[order](a, b));
}
