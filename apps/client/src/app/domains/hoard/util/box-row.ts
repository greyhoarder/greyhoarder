import type { HobbyStatus } from '@greyhoarder/domain/hoard';

export interface BoxKit {
  /** The kit's name with its edition, e.g. "Boyz (2026)". */
  readonly name: string;
  /** The manufacturer's article number, e.g. "50-80", if the kit has one. */
  readonly sku?: string;
}

export interface Price {
  readonly amount: number;
  /** ISO 4217 code, e.g. "EUR". */
  readonly currency: string;
}

/** One box in a list of boxes, with how many of its minis stand at each status. */
export interface BoxRow {
  readonly id: string;
  readonly name: string;
  /** Boxes without a kit have a name only. */
  readonly kit?: BoxKit;
  readonly factions: readonly string[];
  readonly minis: Readonly<Partial<Record<HobbyStatus, number>>>;
  /** ISO date, e.g. "2026-10-12". */
  readonly addedOn: string;
  readonly price?: Price;
  readonly tags: readonly string[];
}
