import type { HobbyStatus } from '@greyhoarder/domain/hoard';
import type { FactionChange, PartChange } from './mini-changes';

/** One version of a catalog kit. */
export interface KitVersion {
  readonly id: string;
  readonly version: number;
}

/** Fewer can't be added at once. */
export const MIN_MINIS = 1;

/** Alike minis to add without a box, from the catalog or put together by the user (docs/domains/hoard.md, Minis). */
export interface MinisToAdd {
  readonly name: string;
  readonly factions: readonly FactionChange[];
  readonly status: HobbyStatus;
  readonly parts: readonly PartChange[];
  readonly notes?: string;
  /** The catalog kit they come from, in the version the search found; none for the user's own. */
  readonly kit?: KitVersion;
  readonly count: number;
}
