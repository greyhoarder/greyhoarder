import type { DepartureReason, HobbyStatus } from '@greyhoarder/domain/hoard';

export const STATUS_LABELS: Readonly<Record<HobbyStatus, string>> = {
  sprue: 'On the sprue',
  built: 'Built',
  primed: 'Primed',
  painted: 'Painted',
  done: 'Done',
};

/** Short forms for counts, e.g. "7 sprue · 3 built". */
export const STATUS_SHORT_LABELS: Readonly<Record<HobbyStatus, string>> = {
  sprue: 'sprue',
  built: 'built',
  primed: 'primed',
  painted: 'painted',
  done: 'done',
};

/** Why minis left the hoard, as reasons to choose and as badges. */
export const DEPARTURE_LABELS: Readonly<Record<DepartureReason, string>> = {
  sold: 'Sold',
  'given-away': 'Given away',
  stripped: 'Stripped for parts',
  lost: 'Lost or broken',
};
