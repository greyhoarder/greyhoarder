import type { Mini } from '@greyhoarder/domain/hoard';

/** Minis as a change on the server stored them. */
export interface ChangedMinis {
  readonly minis: readonly Mini[];
  /** The names of the user's own factions the minis carry, by id, also those the change added. */
  readonly ownFactionNames: ReadonlyMap<string, string>;
}
