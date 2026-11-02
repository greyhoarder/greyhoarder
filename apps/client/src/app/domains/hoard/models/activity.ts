/** One line of a month: minis that reached a status, or boxes added. */
export interface ActivityEntryData {
  readonly kind: 'built' | 'primed' | 'painted' | 'done' | 'box';
  /** How many minis, or boxes for `box`. */
  readonly count: number;
  /** How many minis, also for `box`. */
  readonly minis: number;
  /** The names of the armies of the minis; empty for `box`. */
  readonly factions: readonly string[];
  readonly items: readonly { readonly id: string; readonly name: string }[];
}

/** The last year of a hoard: the days with steps and what happened month by month, newest first. */
export interface ActivityOverview {
  readonly days: readonly { readonly date: string; readonly steps: number }[];
  readonly months: readonly {
    /** E.g. "2026-11". */
    readonly month: string;
    readonly entries: readonly ActivityEntryData[];
  }[];
}
