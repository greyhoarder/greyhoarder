import { progressOf } from './box-facts';
import type { BoxRow } from './box-row';

/** An empty set filters nothing; within one chip any value matches, across chips all must. */
export interface BoxFilter {
  readonly factions: ReadonlySet<string>;
  /** Box progresses, as the progress filter reports them. */
  readonly progresses: ReadonlySet<string>;
  readonly tags: ReadonlySet<string>;
}

export function matchesBoxFilter(box: BoxRow, filter: BoxFilter): boolean {
  return (
    matchesAny(filter.factions, box.factions) &&
    matchesAny(filter.progresses, [progressOf(box)]) &&
    matchesAny(filter.tags, box.tags)
  );
}

/** Whether the box's name, its kit, the kit's article number or a tag contains the query, ignoring case. */
export function matchesBoxSearch(box: BoxRow, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) {
    return true;
  }
  return [box.name, box.kit?.name, box.kit?.sku, ...box.tags].some((text) =>
    text?.toLowerCase().includes(needle),
  );
}

function matchesAny(wanted: ReadonlySet<string>, values: readonly string[]): boolean {
  return wanted.size === 0 || values.some((value) => wanted.has(value));
}
