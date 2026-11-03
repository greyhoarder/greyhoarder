/** One line of a month: minis that reached a status, or boxes added. */
export interface ActivityEntryData {
  readonly kind: 'built' | 'primed' | 'painted' | 'done' | 'box';
  /** How many minis, or boxes for `box`. */
  readonly count: number;
  /** How many minis, also for `box`. */
  readonly minis: number;
  /** Per army of the minis the most first, or per box with its id. */
  readonly rows: readonly { readonly id?: string; readonly name: string; readonly minis: number }[];
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
