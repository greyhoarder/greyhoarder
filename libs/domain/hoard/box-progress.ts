import { type HobbyStatus, hobbyStatuses, isPainted } from './hobby-status.js';

/** How far the minis of a box have come, derived from their statuses. */
export const boxProgresses = ['untouched', 'started', 'done'] as const;

export type BoxProgress = (typeof boxProgresses)[number];

/**
 * Untouched while every mini is still on the sprue, done once every mini is
 * painted, started in between. A box without minis counts as untouched.
 */
export function boxProgress(statuses: readonly HobbyStatus[]): BoxProgress {
  if (statuses.every((status) => status === 'sprue')) {
    return 'untouched';
  }
  return statuses.every(isPainted) ? 'done' : 'started';
}

/**
 * How far a group of minis has come, from 0 to 100: each mini counts by its
 * status, from 0 on the sprue up to 100 when done, in equal steps
 * (built 25, primed 50, painted 75). No minis count as 0.
 */
export function progressPercent(statuses: readonly HobbyStatus[]): number {
  if (statuses.length === 0) {
    return 0;
  }
  const lastStep = hobbyStatuses.length - 1;
  const sum = statuses.reduce(
    (total, status) => total + hobbyStatuses.indexOf(status) / lastStep,
    0,
  );
  return Math.round((sum / statuses.length) * 100);
}
