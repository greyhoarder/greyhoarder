/** Where a mini stands, in the order of the hobby pipeline (ADR-0019). Any status can be set, also backwards. */
export const hobbyStatuses = ['sprue', 'built', 'primed', 'painted', 'based'] as const;

export type HobbyStatus = (typeof hobbyStatuses)[number];

/** Painted counts as done for the hoard's tally, and based is painted as well. */
export function isPainted(status: HobbyStatus): boolean {
  return hobbyStatuses.indexOf(status) >= hobbyStatuses.indexOf('painted');
}
