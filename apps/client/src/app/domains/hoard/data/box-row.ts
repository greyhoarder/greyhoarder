import { type BoxProgress, boxProgress, progressPercent } from '../models/box-progress';
import { type Box, hasReached, type HobbyStatus, hobbyStatuses, type Mini } from '@greyhoarder/domain/hoard';
import { factionNamesOf } from '../util/kit-labels';

export interface BoxKit {
  /** The kit's name with its edition, e.g. "Boyz (2026)". */
  readonly name: string;
  /** The manufacturer's article number, e.g. "50-80", if the kit has one. */
  readonly sku?: string;
}

/** One box in a list of boxes, with how many of its minis stand at each status. */
export interface BoxRow {
  readonly id: string;
  readonly name: string;
  /** Boxes without a kit have a name only. */
  readonly kit?: BoxKit;
  readonly factions: readonly string[];
  readonly minis: Readonly<Partial<Record<HobbyStatus, number>>>;
  /** ISO date, e.g. "2026-10-12". */
  readonly addedOn: string;
  readonly tags: readonly string[];
}

/** One row per box, counting the minis that came out of it; factions without a known name are left out. */
export function toBoxRows(
  boxes: readonly Box[],
  minis: readonly Mini[],
  factionNames: ReadonlyMap<string, string>,
): BoxRow[] {
  const counts = new Map<string, Partial<Record<HobbyStatus, number>>>();
  for (const mini of minis) {
    if (mini.boxId === undefined) {
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
    addedOn: box.addedOn,
    tags: box.tags,
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
  return boxProgress(statusesOf(box));
}

/** 0 to 100, weighted by status (see `progressPercent`). */
export function percentOf(box: BoxRow): number {
  return progressPercent(statusesOf(box));
}

/** One status per mini of the box. */
function statusesOf(box: BoxRow): HobbyStatus[] {
  return hobbyStatuses.flatMap((status) => Array<HobbyStatus>(box.minis[status] ?? 0).fill(status));
}
