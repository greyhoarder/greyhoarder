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

/** An army of a game system, e.g. Orks. */
export interface CatalogFaction {
  /** `<system>/<faction>`, e.g. "warhammer-40000/orks". */
  readonly id: string;
  readonly systemId: string;
  readonly name: string;
  /** Id of its group within the system; left out with `partOfId`. */
  readonly groupId?: string;
  /** A faction whose kits all apply to this one as well. */
  readonly partOfId?: string;
}
