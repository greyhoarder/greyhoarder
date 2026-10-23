import {
  type BoxProgress,
  boxProgress,
  type HobbyStatus,
  hobbyStatuses,
  isPainted,
  progressPercent,
} from '@greyhoarder/domain/hoard';
import type { BoxRow } from './box-row';

export const PROGRESS_LABELS: Readonly<Record<BoxProgress, string>> = {
  untouched: 'Untouched',
  started: 'Started',
  done: 'Done',
};

export function miniCount(box: BoxRow): number {
  return hobbyStatuses.reduce((sum, status) => sum + (box.minis[status] ?? 0), 0);
}

export function sprueCount(box: BoxRow): number {
  return box.minis.sprue ?? 0;
}

export function paintedCount(box: BoxRow): number {
  return hobbyStatuses.filter(isPainted).reduce((sum, status) => sum + (box.minis[status] ?? 0), 0);
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

/** E.g. "Boyz (2026) · 50-80"; "No kit" for boxes without one. */
export function kitLine(box: BoxRow): string {
  if (!box.kit) {
    return 'No kit';
  }
  const { name, sku } = box.kit;
  return sku ? `${name} · ${sku}` : name;
}

/** Dates follow the English interface, e.g. "12 Oct 2026" (three-letter months, also "Sep"). */
export function formatDate(isoDate: string): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).formatToParts(new Date(isoDate));
  const part = (type: Intl.DateTimeFormatPartTypes): string =>
    parts.find((candidate) => candidate.type === type)?.value ?? '';
  return `${part('day')} ${part('month')} ${part('year')}`;
}
