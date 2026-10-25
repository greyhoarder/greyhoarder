import type { Box, HobbyStatus, Mini } from '@greyhoarder/domain/hoard';
import { factionNamesOf } from '../util/kit-labels';

/** Alike minis (same name, factions, status and parts) bundled into one row of a list. */
export interface MiniRow {
  /** That of the row's first mini. */
  readonly id: string;
  readonly name: string;
  readonly factions: readonly string[];
  /** Name of the origin box; minis without a box have none. */
  readonly box?: string;
  /** Id of the origin box, which tells boxes with the same name apart. */
  readonly boxId?: string;
  readonly parts: readonly string[];
  readonly status: HobbyStatus;
  readonly isOnWorkbench: boolean;
  readonly count: number;
}

/**
 * Alike minis as one row, in the order their first mini comes; minis from different boxes or
 * with and without a place on the workbench stay apart (docs/domains/hoard.md, Lists of minis).
 */
export function toMiniRows(
  minis: readonly Mini[],
  boxes: readonly Box[],
  factionNames: ReadonlyMap<string, string>,
): MiniRow[] {
  const boxNames = new Map(boxes.map((box) => [box.id, box.name]));
  const rows = new Map<string, MiniRow>();
  for (const mini of minis) {
    const key = JSON.stringify([mini.name, mini.factionIds, mini.status, mini.parts, mini.boxId, mini.isOnWorkbench]);
    const row = rows.get(key);
    rows.set(
      key,
      row
        ? { ...row, count: row.count + 1 }
        : {
            id: mini.id,
            name: mini.name,
            factions: factionNamesOf(mini.factionIds, factionNames),
            box: mini.boxId === undefined ? undefined : boxNames.get(mini.boxId),
            boxId: mini.boxId,
            parts: mini.parts,
            status: mini.status,
            isOnWorkbench: mini.isOnWorkbench,
            count: 1,
          },
    );
  }
  return [...rows.values()];
}

/** How many minis the rows stand for. */
export function countMinis(rows: readonly MiniRow[]): number {
  return rows.reduce((sum, row) => sum + row.count, 0);
}
