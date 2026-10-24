import type { HobbyStatus } from './hobby-status';

/** Alike minis (same name, factions, status and parts) bundled into one row of a list. */
export interface MiniRow {
  readonly id: string;
  readonly name: string;
  readonly factions: readonly string[];
  /** Name of the origin box; minis without a box have none. */
  readonly box?: string;
  readonly parts: readonly string[];
  readonly status: HobbyStatus;
  readonly isOnWorkbench: boolean;
  readonly count: number;
}

/** How many minis the rows stand for. */
export function countMinis(rows: readonly MiniRow[]): number {
  return rows.reduce((sum, row) => sum + row.count, 0);
}
