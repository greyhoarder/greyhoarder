import type { HobbyStatus } from '../models/hobby-status';

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
