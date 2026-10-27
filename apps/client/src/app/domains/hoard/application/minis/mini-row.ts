import type { Box, Departure, HobbyStatus, Mini } from '@greyhoarder/domain/hoard';
import { alikeKey } from '../../models/mini-alikeness';
import { groupKey } from '../../models/mini-groups';
import { factionNamesOf } from '../../util/kit-labels';

/** One mini, or alike minis (same name, factions, status, parts and notes) bundled, as a row of a list. */
export interface MiniRow {
  /** That of the row's first mini. */
  readonly id: string;
  /**
   * Equal for minis of the same group: same name, factions and parts (docs/domains/hoard.md, Lists
   * of minis). Left out, a row is a group of its own.
   */
  readonly groupId?: string;
  readonly name: string;
  readonly factions: readonly string[];
  /** Name of the origin box; minis without a box have none. */
  readonly box?: string;
  /** Id of the origin box, which tells boxes with the same name apart. */
  readonly boxId?: string;
  /** Number of the origin box among those with its name, e.g. 2 for "Boyz (2026) #2". */
  readonly boxNumber?: number;
  /** The names of the parts. */
  readonly parts: readonly string[];
  readonly status: HobbyStatus;
  readonly isOnWorkbench: boolean;
  /** Set for gone minis. */
  readonly departure?: Departure;
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
  partNames: ReadonlyMap<string, string> = new Map(),
): MiniRow[] {
  const toRow = rowOf(boxes, factionNames, partNames);
  const rows = new Map<string, MiniRow>();
  for (const mini of minis) {
    const key = alikeKey(mini);
    const row = rows.get(key);
    rows.set(key, row ? { ...row, count: row.count + 1 } : toRow(mini));
  }
  return [...rows.values()];
}

/** Every mini as a row of its own, in their order. */
export function toSingleRows(
  minis: readonly Mini[],
  boxes: readonly Box[],
  factionNames: ReadonlyMap<string, string>,
  partNames: ReadonlyMap<string, string> = new Map(),
): MiniRow[] {
  return minis.map(rowOf(boxes, factionNames, partNames));
}

function rowOf(
  boxes: readonly Box[],
  factionNames: ReadonlyMap<string, string>,
  partNames: ReadonlyMap<string, string>,
): (mini: Mini) => MiniRow {
  const byId = new Map(boxes.map((box) => [box.id, box]));
  return (mini) => ({
    id: mini.id,
    groupId: groupKey(mini),
    name: mini.name,
    factions: factionNamesOf(mini.factionIds, factionNames),
    box: mini.boxId === undefined ? undefined : byId.get(mini.boxId)?.name,
    boxId: mini.boxId,
    boxNumber: mini.boxId === undefined ? undefined : byId.get(mini.boxId)?.number,
    parts: mini.parts.flatMap((part) => partNames.get(part.partId) ?? []),
    status: mini.status,
    isOnWorkbench: mini.isOnWorkbench,
    departure: mini.departure,
    count: 1,
  });
}

/** How many minis the rows stand for. */
export function countMinis(rows: readonly MiniRow[]): number {
  return rows.reduce((sum, row) => sum + row.count, 0);
}
