import { type BoxProgress, boxProgress, progressPercent } from '../../models/box-progress';
import {
  type Box,
  hasReached,
  type HobbyStatus,
  hobbyStatuses,
  isGone,
  type Mini,
} from '@greyhoarder/domain/hoard';
import { factionNamesOf } from '../../util/kit-labels';

export interface BoxKit {
  /** The kit's name with its edition, e.g. "Boyz (2026)". */
  readonly name: string;
  /** The manufacturer's article number, e.g. "50-80", if the kit has one. */
  readonly sku?: string;
}

/** One box in a list of boxes, with how many of its minis stand at each status and how many are gone. */
export interface BoxRow {
  readonly id: string;
  readonly name: string;
  /** Boxes without a kit have a name only. */
  readonly kit?: BoxKit;
  readonly factions: readonly string[];
  /** The minis that are not gone, by status. */
  readonly minis: Readonly<Partial<Record<HobbyStatus, number>>>;
  /** Left out when none is gone. */
  readonly goneCount?: number;
  /** ISO date, e.g. "2026-10-12". */
  readonly addedOn: string;
  readonly tags: readonly string[];
  /** Tells boxes with the same name apart, e.g. 2 for "Boyz (2026) #2". */
  readonly number: number;
}

/** One row per box, counting the minis that came out of it; factions without a known name are left out. */
export function toBoxRows(
  boxes: readonly Box[],
  minis: readonly Mini[],
  factionNames: ReadonlyMap<string, string>,
): BoxRow[] {
  const counts = new Map<string, Partial<Record<HobbyStatus, number>>>();
  const goneCounts = new Map<string, number>();
  for (const mini of minis) {
    if (mini.boxId === undefined) {
      continue;
    }
    if (isGone(mini)) {
      goneCounts.set(mini.boxId, (goneCounts.get(mini.boxId) ?? 0) + 1);
      continue;
    }
    const count = counts.get(mini.boxId) ?? {};
    count[mini.status] = (count[mini.status] ?? 0) + 1;
    counts.set(mini.boxId, count);
  }
  return boxes.map((box) => ({
    id: box.id,
    name: box.name,
    kit: box.kit && { name: box.kit.name, sku: box.kit.sku },
    factions: factionNamesOf(box.factionIds, factionNames),
    minis: counts.get(box.id) ?? {},
    goneCount: goneCounts.get(box.id) ?? 0,
    addedOn: box.addedOn,
    tags: box.tags,
    number: box.number,
  }));
}

export function miniCount(box: BoxRow): number {
  return hobbyStatuses.reduce((sum, status) => sum + (box.minis[status] ?? 0), 0);
}

export function sprueCount(box: BoxRow): number {
  return box.minis.sprue ?? 0;
}

export function paintedCount(box: BoxRow): number {
  return hobbyStatuses
    .filter((status) => hasReached(status, 'painted'))
    .reduce((sum, status) => sum + (box.minis[status] ?? 0), 0);
}

export function progressOf(box: BoxRow): BoxProgress {
  return boxProgress(statusesOf(box), box.goneCount ?? 0);
}

/** 0 to 100, weighted by status (see `progressPercent`); 0 once all minis are gone. */
export function percentOf(box: BoxRow): number {
  const statuses = statusesOf(box);
  return statuses.length > 0 ? progressPercent(statuses) : 0;
}

/** One status per mini of the box. */
function statusesOf(box: BoxRow): HobbyStatus[] {
  return hobbyStatuses.flatMap((status) => Array<HobbyStatus>(box.minis[status] ?? 0).fill(status));
}
