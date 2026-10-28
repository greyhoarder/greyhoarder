import type { MiniRow } from './mini-row';

/** Whether the row's name, a part or its box contains the query, ignoring case. */
export function matchesSearch(row: MiniRow, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) {
    return true;
  }
  return [row.name, ...row.parts, row.box, row.kit].some((text) =>
    text?.toLowerCase().includes(needle),
  );
}
