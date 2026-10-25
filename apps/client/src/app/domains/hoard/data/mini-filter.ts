import type { MiniRow } from './mini-row';

/** The filter value for minis without a box. */
export const NONE = '';

/** An empty set filters nothing; within one chip any value matches, across chips all must. */
export interface MiniFilter {
  readonly factions: ReadonlySet<string>;
  /** Hobby statuses, as the status filter reports them. */
  readonly statuses: ReadonlySet<string>;
  /** Box ids, so boxes with the same name stay apart. */
  readonly boxes: ReadonlySet<string>;
}

export function matchesFilter(row: MiniRow, filter: MiniFilter): boolean {
  return (
    matchesAny(filter.factions, row.factions) &&
    matchesAny(filter.statuses, [row.status]) &&
    matchesAny(filter.boxes, [row.boxId ?? NONE])
  );
}

function matchesAny(wanted: ReadonlySet<string>, values: readonly string[]): boolean {
  return wanted.size === 0 || values.some((value) => wanted.has(value));
}
