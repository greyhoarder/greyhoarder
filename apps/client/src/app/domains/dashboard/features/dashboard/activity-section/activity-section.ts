import { Component, computed, input, linkedSignal, output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideCheck,
  lucideChevronDown,
  lucideHammer,
  lucidePackagePlus,
  lucidePaintbrush,
  lucideSprayCan,
} from '@ng-icons/lucide';
import {
  type ActivityDay,
  type ActivityEntry,
  type ActivityMonth,
  type ActivitySummaryRow,
  minisLabel,
} from './activity';

const FILLS = ['fill-muted', 'fill-primary/25', 'fill-primary/50', 'fill-primary/75', 'fill-primary'] as const;

const SHADES = ['bg-muted', 'bg-primary/25', 'bg-primary/50', 'bg-primary/75', 'bg-primary'] as const;

const ICONS: Readonly<Record<ActivityEntry['kind'], string>> = {
  built: 'lucideHammer',
  primed: 'lucideSprayCan',
  painted: 'lucidePaintbrush',
  done: 'lucideCheck',
  box: 'lucidePackagePlus',
};

/** The last year as a compact heatmap with what happened month by month (docs/screens/dashboard.md). */
@Component({
  selector: 'app-activity-section',
  imports: [RouterLink, NgIcon],
  providers: [
    provideIcons({ lucideCheck, lucideChevronDown, lucideHammer, lucidePackagePlus, lucidePaintbrush, lucideSprayCan }),
  ],
  templateUrl: './activity-section.html',
  host: { class: 'flex flex-col gap-4', 'data-testid': 'dashboard-activity' },
})
export class ActivitySection {
  readonly days = input.required<readonly ActivityDay[]>();
  readonly months = input.required<readonly ActivityMonth[]>();
  /** Newest first. */
  /** What the chosen year adds up to. */
  readonly summary = input.required<readonly ActivitySummaryRow[]>();
  readonly years = input.required<readonly number[]>();
  readonly year = input.required<number>();
  readonly yearChosen = output<number>();

  /** Each at the middle of its row of cells: rows of 10 with a gap of 2, 82 in all. */
  protected readonly dayLabels = [
    { label: 'Mon', top: (5 / 82) * 100 },
    { label: 'Wed', top: (29 / 82) * 100 },
    { label: 'Fri', top: (53 / 82) * 100 },
    { label: 'Sun', top: (77 / 82) * 100 },
  ];
  protected readonly weeks = computed(() => Math.ceil(this.days().length / 7));
  protected readonly viewBox = computed(() => `0 0 ${this.weeks() * 12 - 2} 82`);
  /** Cells stop growing at 10 px, 12 with their gap, plus the column of the day labels. */
  protected readonly maxWidth = computed(() => this.weeks() * 0.75 + 2);
  /** With its padding and border, so the bobbles never stretch. */
  protected readonly cardWidth = computed(() => this.maxWidth() + 1.625);
  protected readonly shades = SHADES;
  protected readonly icons = ICONS;
  /** Entries start closed; one is open at a time. */
  protected readonly openEntryId = signal<string | undefined>(undefined);
  /** Only the button shows at first; another year starts over. */
  protected readonly shownEntryCount = linkedSignal({ source: this.year, computation: () => 0 });

  protected readonly total = computed(() => this.days().reduce((sum, day) => sum + day.steps, 0));
  protected readonly totalText = computed(() => `${minisLabel(this.total())} moved a step in ${this.year()}`);
  /** Each day with its shade, by its share of the busiest day. */
  protected readonly cells = computed(() => {
    const busiest = Math.max(1, ...this.days().map((day) => day.steps));

    return this.days().map((day) => ({
      ...day,
      fill: FILLS[day.steps === 0 ? 0 : Math.ceil((day.steps / busiest) * 4)],
      label: `${day.steps === 0 ? 'No' : day.steps} ${day.steps === 1 ? 'step' : 'steps'} on ${day.date}`,
    }));
  });
  /** Per week with a first of a month, its short name, at the column of that week. */
  protected readonly monthLabels = computed(() =>
    this.days().flatMap((day, index) =>
      index % 7 === 0 && Number(day.date.slice(8)) <= 7
        ? {
            column: index / 7,
            label: new Date(`${day.date}T12:00`).toLocaleDateString('en', { month: 'short' }),
          }
        : [],
    ),
  );
  /** The months with the entries shown so far, the newest first. */
  protected readonly shownMonths = computed(() => {
    let left = this.shownEntryCount();

    return this.months().flatMap((month) => {
      const entries = month.entries.slice(0, left);
      left -= entries.length;

      return entries.length === 0 ? [] : { ...month, entries };
    });
  });
  protected readonly hasMore = computed(
    () => this.shownEntryCount() < this.months().reduce((sum, month) => sum + month.entries.length, 0),
  );

  protected toggle(id: string): void {
    this.openEntryId.update((open) => (open === id ? undefined : id));
  }

  protected showMore(): void {
    this.shownEntryCount.update((count) => count + 1);
  }
}
