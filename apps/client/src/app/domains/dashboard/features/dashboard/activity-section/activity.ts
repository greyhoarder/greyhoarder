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

/** One line of a month: minis that reached a status, or boxes added. */
export interface ActivityEntry {
  readonly id: string;
  readonly kind: EntryKind;
  readonly text: string;
  readonly detail: string;
  readonly items: readonly { readonly id: string; readonly name: string; readonly link: string }[];
}

export interface ActivityMonth {
  readonly title: string;
  readonly entries: readonly ActivityEntry[];
}

/** Monday of the week 51 weeks before the week of `today`, then every day up to `today`. */
export function lastYearDates(today: Date): string[] {
  const start = new Date(today);
  start.setDate(today.getDate() - ((today.getDay() + 6) % 7) - 51 * 7);
  const dates: string[] = [];

  for (const day = new Date(start); day <= today; day.setDate(day.getDate() + 1)) {
    dates.push(isoDate(day));
  }

  return dates;
}

export function isoDate(day: Date): string {
  const month = String(day.getMonth() + 1).padStart(2, '0');
  const date = String(day.getDate()).padStart(2, '0');

  return `${day.getFullYear()}-${month}-${date}`;
}

/** Every day of the last 52 weeks, those without steps included. */
export function activityDays(days: ActivityOverview['days'], today: Date): ActivityDay[] {
  const steps = new Map(days.map((day) => [day.date, day.steps]));

  return lastYearDates(today).map((date) => ({ date, steps: steps.get(date) ?? 0 }));
}

/** The months as their lines read. */
export function activityMonths(months: ActivityOverview['months']): ActivityMonth[] {
  return months.map(({ month, entries }) => ({
    title: new Date(`${month}-01T12:00`).toLocaleDateString('en', { month: 'long', year: 'numeric' }),
    entries: entries.map((entry) => ({
      id: `${month}-${entry.kind}`,
      kind: entry.kind,
      ...texts(entry),
      items: entry.items.map(({ id, name }) => ({
        id,
        name,
        link: `/hoard/${entry.kind === 'box' ? 'boxes' : 'minis'}/${id}`,
      })),
    })),
  }));
}

interface EntryTexts {
  readonly text: string;
  readonly detail: string;
}

function texts({ kind, count, minis, factions }: ActivityEntryData): EntryTexts {
  if (kind === 'box') {
    return { text: `Added ${count === 1 ? '1 box' : `${count} boxes`}`, detail: `· ${minisLabel(minis)}` };
  }

  const [faction] = factions;
  const detail = factions.length > 1 ? `in ${factions.length} factions` : faction === undefined ? '' : `· ${faction}`;

  return { text: `${VERBS[kind]} ${minisLabel(count)}`, detail };
}

export function minisLabel(count: number): string {
  return count === 1 ? '1 mini' : `${count} minis`;
}
