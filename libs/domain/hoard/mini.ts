import type { HobbyStatus } from './hobby-status.js';
import { InvalidMiniError } from './errors/invalid-mini.error.js';

/** One physical miniature, built or still on the sprue (docs/domains/hoard.md). */
export interface Mini {
  readonly id: string;
  /** What it was built as, or what its slot suggests while on the sprue. */
  readonly name: string;
  /** Catalog factions or the user's own; a mini may have none. */
  readonly factionIds: readonly string[];
  readonly status: HobbyStatus;
  readonly parts: readonly string[];
  /** The box it came out of; minis bought loose have none. */
  readonly boxId?: string;
  readonly isOnWorkbench: boolean;
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
