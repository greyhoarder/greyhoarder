import type { ActivityEntryData, ActivityOverview } from '../../../../hoard/api';

type EntryKind = ActivityEntryData['kind'];

const VERBS: Readonly<Record<Exclude<EntryKind, 'box'>, string>> = {
  built: 'Built',
  primed: 'Primed',
  painted: 'Painted',
  done: 'Finished',
};

/** One day of the heatmap. */
export interface ActivityDay {
  /** ISO date, e.g. "2026-10-12". */
  readonly date: string;
  readonly steps: number;
}

/** One entry of a month: minis that reached a status, or boxes added, with a row per army or box. */
export interface ActivityEntry {
  readonly id: string;
  readonly kind: EntryKind;
  readonly text: string;
  readonly rows: readonly {
    readonly name: string;
    readonly count: string;
    readonly link: string;
  }[];
}

export interface ActivityMonth {
  readonly id: string;
  readonly name: string;
  readonly year: string;
  readonly entries: readonly ActivityEntry[];
}

/** From the Monday of the week of January 1 to December 31. */
function dates(year: number): string[] {
  const start = new Date(year, 0, 1);
  const last = new Date(year, 11, 31);
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  const days: string[] = [];

  for (const day = new Date(start); day <= last; day.setDate(day.getDate() + 1)) {
    days.push(isoDate(day));
  }

  return days;
}

export function isoDate(day: Date): string {
  const month = String(day.getMonth() + 1).padStart(2, '0');
  const date = String(day.getDate()).padStart(2, '0');

  return `${day.getFullYear()}-${month}-${date}`;
}

/** Every day of the year's heatmap, those without steps included. */
export function activityDays(days: ActivityOverview['days'], year: number): ActivityDay[] {
  const steps = new Map(days.map((day) => [day.date, day.steps]));

  return dates(year).map((date) => ({ date, steps: steps.get(date) ?? 0 }));
}

/** The years with activity and the current one, newest first. */
export function activityYears({ days, months }: ActivityOverview, today: Date): number[] {
  const years = [...days.map((day) => day.date), ...months.map((each) => each.month)].map((day) =>
    Number(day.slice(0, 4)),
  );

  return [...new Set([today.getFullYear(), ...years])].sort((a, b) => b - a);
}

/** One tile of the summary of a year. */
export interface ActivitySummaryRow {
  readonly label: string;
  readonly value: string;
  readonly note: string;
}

/** What the year adds up to; `days` are those of its heatmap. */
export function activitySummary(
  months: ActivityOverview['months'],
  days: readonly ActivityDay[],
  year: number,
  today: Date,
): ActivitySummaryRow[] {
  const entries = months.filter(({ month }) => month.startsWith(`${year}-`)).flatMap((month) => month.entries);

  const sumOf = (kind: EntryKind, field: 'count' | 'minis'): number =>
    entries.filter((entry) => entry.kind === kind).reduce((sum, entry) => sum + entry[field], 0);

  const lastDay = year === today.getFullYear() ? isoDate(today) : `${year}-12-31`;
  const ofYear = days.filter((day) => day.date.startsWith(`${year}-`) && day.date <= lastDay);
  const streak = longestStreak(ofYear);

  return [
    { label: 'Boxes added', value: String(sumOf('box', 'count')), note: minisLabel(sumOf('box', 'minis')) },
    { label: 'Minis painted', value: String(sumOf('painted', 'count')), note: `${sumOf('done', 'count')} finished` },
    {
      label: 'Active days',
      value: String(ofYear.filter((day) => day.steps > 0).length),
      note: `of ${ofYear.length}`,
    },
    { label: 'Best streak', value: streak === 1 ? '1 day' : `${streak} days`, note: 'in a row' },
  ];
}

/** The most days with steps in a row. */
function longestStreak(days: readonly ActivityDay[]): number {
  let current = 0;
  let longest = 0;

  for (const day of days) {
    current = day.steps > 0 ? current + 1 : 0;
    longest = Math.max(longest, current);
  }

  return longest;
}

/** The months of the year as their entries read. */
export function activityMonths(months: ActivityOverview['months'], year: number): ActivityMonth[] {
  return months
    .filter(({ month }) => month.startsWith(`${year}-`))
    .map(({ month, entries }) => ({
      id: month,
      name: new Date(`${month}-01T12:00`).toLocaleDateString('en', { month: 'long' }),
      year: String(year),
      entries: entries.map((entry) => ({
        id: `${month}-${entry.kind}`,
        kind: entry.kind,
        text: entryText(entry),
        rows: entry.rows.map(({ id, name, minis }) => ({
          name,
          count: minisLabel(minis),
          link: id === undefined ? '/hoard/minis' : `/hoard/boxes/${id}`,
        })),
      })),
    }));
}

function entryText({ kind, count, rows }: ActivityEntryData): string {
  if (kind === 'box') {
    return `Added ${count === 1 ? '1 box' : `${count} boxes`}`;
  }

  const factions = rows.length === 1 ? '1 faction' : `${rows.length} factions`;

  return `${VERBS[kind]} ${minisLabel(count)} in ${factions}`;
}

export function minisLabel(count: number): string {
  return count === 1 ? '1 mini' : `${count} minis`;
}
