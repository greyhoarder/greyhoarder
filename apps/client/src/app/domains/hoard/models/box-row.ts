import { type BoxProgress, boxProgress, progressPercent } from './box-progress';
import { hasReached, type HobbyStatus, hobbyStatuses } from './hobby-status';
import { boxKitName, type Kit } from './kit';

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

export function miniCount(box: BoxRow): number {
  return hobbyStatuses.reduce((sum, status) => sum + (box.minis[status] ?? 0), 0);
}

export function sprueCount(box: BoxRow): number {
  return box.minis.sprue ?? 0;
}

export function paintedCount(box: BoxRow): number {
  return hobbyStatuses.filter((status) => hasReached(status, 'painted')).reduce((sum, status) => sum + (box.minis[status] ?? 0), 0);
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

/** A box is of the kit when its name and release match: the product code if both have one, else the name. */
export function isBoxOfKit(box: BoxRow, kit: Kit): boolean {
  if (!box.kit) {
    return false;
  }
  if (box.kit.sku !== undefined && kit.sku !== undefined) {
    return box.kit.sku === kit.sku;
  }
  return box.kit.name === boxKitName(kit);
}
