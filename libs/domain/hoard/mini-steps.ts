import { type HobbyStatus, hobbyStatuses } from './hobby-status.js';
import type { Mini } from './mini.js';

/** The statuses a mini reaches by a step; on the sprue is where it starts. */
export type StepStatus = Exclude<HobbyStatus, 'sprue'>;

const STEP_STATUSES = hobbyStatuses.filter((status): status is StepStatus => status !== 'sprue');

/** The day a mini reached a status (docs/use-cases/see-activity.md). */
export interface MiniStep {
  readonly miniId: string;
  readonly status: StepStatus;
  /** ISO date, e.g. "2026-10-12". */
  readonly on: string;
}

/** What a change of minis does to their steps. */
export interface StepChange {
  readonly reached: readonly MiniStep[];
  readonly undone: readonly { readonly miniId: string; readonly statuses: readonly StepStatus[] }[];
}

/**
 * The steps of minis changed on a day, `before` and `after` in the same order: a mini further on
 * reached its new status, not those it skipped; a mini further back undid those past its new status.
 */
export function stepChange(before: readonly Mini[], after: readonly Mini[], on: string): StepChange {
  const moved = before.flatMap((mini, index) => {
    const next = after[index];
    return next && next.status !== mini.status ? { mini, next } : [];
  });
  const isForward = ({ mini, next }: (typeof moved)[number]) =>
    hobbyStatuses.indexOf(next.status) > hobbyStatuses.indexOf(mini.status);
  return {
    reached: moved
      .filter(isForward)
      .flatMap(({ next }) => (next.status === 'sprue' ? [] : { miniId: next.id, status: next.status, on })),
    undone: moved
      .filter((each) => !isForward(each))
      .map(({ next }) => ({
        miniId: next.id,
        statuses: STEP_STATUSES.filter((status) => !hasStatus(next.status, status)),
      })),
  };
}

/** Removes every step of deleted minis. */
export function stepsOfDeleted(miniIds: readonly string[]): StepChange {
  return { reached: [], undone: miniIds.map((miniId) => ({ miniId, statuses: STEP_STATUSES })) };
}

/** The day of a moment in the server's time zone, as an ISO date. */
export function isoDay(moment: Date): string {
  const month = String(moment.getMonth() + 1).padStart(2, '0');
  const day = String(moment.getDate()).padStart(2, '0');
  return `${moment.getFullYear()}-${month}-${day}`;
}

function hasStatus(status: HobbyStatus, step: StepStatus): boolean {
  return hobbyStatuses.indexOf(status) >= hobbyStatuses.indexOf(step);
}
