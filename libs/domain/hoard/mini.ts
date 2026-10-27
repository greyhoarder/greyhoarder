import { InvalidMiniError } from './errors/invalid-mini.error.js';
import type { HobbyStatus } from './hobby-status.js';
import type { Departure } from './mini-departure.js';

/** A part on a mini: one of the user's vocabulary, glued or swappable (magnetised). */
export interface MiniPart {
  readonly partId: string;
  readonly isSwappable: boolean;
}

/** One physical miniature, built or still on the sprue (docs/domains/hoard.md). */
export interface Mini {
  readonly id: string;
  /** What it was built as, or what its slot suggests while on the sprue. */
  readonly name: string;
  /** Catalog factions or the user's own; a mini may have none. */
  readonly factionIds: readonly string[];
  readonly status: HobbyStatus;
  readonly parts: readonly MiniPart[];
  /** Kitbash sources, loadout ideas, what is still to do. */
  readonly notes?: string;
  /**
   * The name it got when its box was added; never changes. A mini built under a name of the
   * user's own uses up the suggestion it had on the sprue.
   */
  readonly sprueName?: string;
  /** The box it came out of; minis bought loose have none. */
  readonly boxId?: string;
  readonly isOnWorkbench: boolean;
  /** Set once the mini left the hoard while its record stays; deleted minis are gone for good. */
  readonly departure?: Departure;
}

/**
 * A mini by the rules: a name without surrounding spaces.
 *
 * @throws InvalidMiniError for an empty name
 */
export function parseMini(mini: Mini): Mini {
  const name = mini.name.trim();
  if (name === '') {
    throw new InvalidMiniError();
  }
  return { ...mini, name };
}

/** Whether a mini leaves the workbench on reaching the status: once done (docs/domains/hoard.md, Workbench). */
export function leavesWorkbench(status: HobbyStatus): boolean {
  return status === 'done';
}

/** A mini with a new status; once done, it leaves the workbench. */
export function withStatus(mini: Mini, status: HobbyStatus): Mini {
  return { ...mini, status, isOnWorkbench: leavesWorkbench(status) ? false : mini.isOnWorkbench };
}

/** A mini that left the hoard, off the workbench; without a departure, one back in the hoard. */
export function withDeparture(mini: Mini, departure: Departure | undefined): Mini {
  if (departure === undefined) {
    const { departure: _left, ...back } = mini;
    return back;
  }
  return { ...mini, departure, isOnWorkbench: false };
}
