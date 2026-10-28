import type { HobbyStatus } from '@greyhoarder/domain/hoard';
import type { PartChange } from './mini-changes';

/** Fewer can't be added at once. */
export const MIN_MINIS = 1;

/** Alike minis to add without a box, from the catalog or put together by the user (docs/domains/hoard.md, Minis). */
export interface MinisToAdd {
  readonly name: string;
  readonly factionIds: readonly string[];
  readonly status: HobbyStatus;
  readonly parts: readonly PartChange[];
  readonly notes?: string;
  readonly count: number;
}
