import {
  EmptyBoxError,
  hasReached,
  type HobbyStatus,
  hobbyStatuses,
} from '@greyhoarder/domain/hoard';

/**
 * How far the minis of a box have come, derived from their statuses; all gone once only gone
 * minis are left, empty without any.
 */
export const boxProgresses = ['untouched', 'started', 'done', 'all-gone', 'empty'] as const;

export type BoxProgress = (typeof boxProgresses)[number];

/**
 * Untouched while every mini that is not gone is still on the sprue, done once every one of
 * them is painted, started in between; all gone when the box has only gone minis, empty when it
 * has none at all.
 *
 * @param statuses those of the minis that are not gone
 * @param goneCount how many minis of the box are gone
 */
export function boxProgress(statuses: readonly HobbyStatus[], goneCount = 0): BoxProgress {
  if (statuses.length === 0) {
    return goneCount > 0 ? 'all-gone' : 'empty';
  }
  if (statuses.every((status) => status === 'sprue')) {
    return 'untouched';
  }
  return statuses.every((status) => hasReached(status, 'painted')) ? 'done' : 'started';
}

/** Boxes all gone or empty have no minis to rate; they show no percentage. */
export function hasPercent(progress: BoxProgress): boolean {
  return progress !== 'all-gone' && progress !== 'empty';
}

/**
 * How far a group of minis has come, from 0 to 100: each mini counts by its
 * status, from 0 on the sprue up to 100 when done, in equal steps
 * (built 25, primed 50, painted 75).
 *
 * @throws EmptyBoxError without minis, which have nothing to rate
 */
export function progressPercent(statuses: readonly HobbyStatus[]): number {
  if (statuses.length === 0) {
    throw new EmptyBoxError();
  }
  const lastStep = hobbyStatuses.length - 1;
  const sum = statuses.reduce(
    (total, status) => total + hobbyStatuses.indexOf(status) / lastStep,
    0,
  );
  return Math.round((sum / statuses.length) * 100);
}
