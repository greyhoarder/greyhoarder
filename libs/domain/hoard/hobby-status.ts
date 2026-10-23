/** Where a mini stands, in the order of the hobby pipeline (ADR-0019). Any status can be set, also backwards. */
export const hobbyStatuses = ['sprue', 'built', 'primed', 'painted', 'done'] as const;

export type HobbyStatus = (typeof hobbyStatuses)[number];

/** A done mini is painted as well, so both count as painted for the hoard's tally. */
export function isPainted(status: HobbyStatus): boolean {
  return hobbyStatuses.indexOf(status) >= hobbyStatuses.indexOf('painted');
}
