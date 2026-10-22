import type { HobbyStatus } from '@greyhoarder/domain/hoard';

export const STATUS_LABELS: Readonly<Record<HobbyStatus, string>> = {
  sprue: 'On the sprue',
  built: 'Built',
  primed: 'Primed',
  painted: 'Painted',
  based: 'Based',
};
