import { isGone } from '@greyhoarder/domain/hoard';
import { factionLineage } from '../../models/faction-lineage';
import type { MiniRow } from './mini-row';

/** The filter value for minis without a box. */
export const NONE = '';

/** The status filter value for gone minis, which are hidden unless it is ticked. */
export const GONE = 'gone';

/** An empty set filters nothing; within one chip any value matches, across chips all must. */
export interface MiniFilter {
  /** A ticked faction matches its own minis and those of every faction that is part of it. */
  readonly factions: ReadonlySet<string>;
  /** The name of the faction each faction is part of, by faction name. */
  readonly partOf: ReadonlyMap<string, string>;
  /** Hobby statuses, as the status filter reports them, and `GONE`. */
  readonly statuses: ReadonlySet<string>;
  /** Box ids, so boxes with the same name stay apart. */
  readonly boxes: ReadonlySet<string>;
}

export function matchesFilter(row: MiniRow, filter: MiniFilter): boolean {
  if (isGone(row) && !filter.statuses.has(GONE)) {
    return false;
  }
  return (
    matchesAny(filter.factions, factionLineage(row.factions, filter.partOf)) &&
    matchesAny(filter.statuses, [isGone(row) ? GONE : row.status]) &&
    matchesAny(filter.boxes, [row.boxId ?? NONE])
  );
}

function matchesAny(wanted: ReadonlySet<string>, values: readonly string[]): boolean {
  return wanted.size === 0 || values.some((value) => wanted.has(value));
}
