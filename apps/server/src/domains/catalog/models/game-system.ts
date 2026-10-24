/** A block of factions for display, e.g. Xenos; it shares no kits. */
export interface FactionGroup {
  readonly id: string;
  readonly name: string;
}

/** A game that armies belong to, e.g. Warhammer 40,000. */
export interface GameSystem {
  /** E.g. "warhammer-40000". */
  readonly id: string;
  readonly name: string;
  readonly groups: readonly FactionGroup[];
}
