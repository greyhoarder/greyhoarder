import type { Kit } from './kit';

/** The kit a box was added from, as it was then; a new version of the kit never changes it. */
export interface BoxKitReference {
  readonly id: string;
  readonly version: number;
  /** The kit's name with its edition, e.g. "Boyz (2026)". */
  readonly name: string;
  /** The manufacturer's product code, e.g. "50-80", if the kit has one. */
  readonly sku?: string;
}

/** Something the user acquired that minis came out of: a kit, a starter set, a bundle (docs/domains/hoard.md). */
export interface Box {
  readonly id: string;
  readonly name: string;
  /** Boxes without a kit have a name only. */
  readonly kit?: BoxKitReference;
  /** Suggested for its minis; the first one is the army it was mainly bought for. */
  readonly factionIds: readonly string[];
  readonly tags: readonly string[];
  /** ISO date, e.g. "2026-10-12". */
  readonly addedOn: string;
}

/** Whether the box was added from the kit, whichever version of it. */
export function isFromKit(box: Box, kit: Kit): boolean {
  return box.kit?.id === kit.id;
}
