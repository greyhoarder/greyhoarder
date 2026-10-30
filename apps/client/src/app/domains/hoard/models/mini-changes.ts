import type { Departure, HobbyStatus } from '@greyhoarder/domain/hoard';

/** A part to put on minis: one of the vocabulary, or a name, which joins the vocabulary if it is new. */
export type PartChange =
  { readonly partId: string; readonly isSwappable: boolean } | { readonly name: string; readonly isSwappable: boolean };

/** A faction to give minis: a catalog faction or an own one by its id, or a name for a new own faction. */
export type FactionChange = { readonly id: string } | { readonly name: string };

/** What to change on every mini of a row alike; left out means unchanged. */
export interface MiniChanges {
  readonly name?: string;
  readonly status?: HobbyStatus;
  readonly factions?: readonly FactionChange[];
  readonly parts?: readonly PartChange[];
  readonly notes?: string;
  readonly isOnWorkbench?: boolean;
  /** Lets the minis leave the hoard; `null` brings them back. */
  readonly departure?: Departure | null;
}
