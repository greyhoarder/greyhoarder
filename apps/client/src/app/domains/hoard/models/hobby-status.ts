/** Where a mini stands, in the order of the hobby pipeline (ADR-0019). Any status can be set, also backwards. */
export const hobbyStatuses = ['sprue', 'built', 'primed', 'painted', 'done'] as const;

export type HobbyStatus = (typeof hobbyStatuses)[number];

/** A mini has reached a status once it is at that status or a later one, so a done mini is painted as well. */
export function hasReached(status: HobbyStatus, step: HobbyStatus): boolean {
  return hobbyStatuses.indexOf(status) >= hobbyStatuses.indexOf(step);
}
