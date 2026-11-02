import { afterNextRender, Component, computed, ElementRef, input, signal, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronDown, lucidePlus } from '@ng-icons/lucide';
import { HlmButton } from '@spartan-ng/helm/button';
import { type ActivityDay, type ActivityEntry, type ActivityMonth, minisLabel } from './activity';

const SHADES = ['bg-muted', 'bg-primary/25', 'bg-primary/50', 'bg-primary/75', 'bg-primary'] as const;

const ICON_COLORS: Readonly<Record<ActivityEntry['kind'], string>> = {
  built: 'bg-muted-foreground/40',
  primed: 'bg-muted-foreground/70',
  painted: 'bg-primary/60',
  done: 'bg-primary',
  box: '',
};

/** Months shown at first and added by "Show more activity". */
const MONTH_STEP = 2;

/** The last year as a compact heatmap with what happened month by month (docs/screens/dashboard.md). */
@Component({
  selector: 'app-activity-section',
  imports: [RouterLink, NgIcon, HlmButton],
  providers: [provideIcons({ lucideChevronDown, lucidePlus })],
  templateUrl: './activity-section.html',
  host: { class: 'flex flex-col gap-4', 'data-testid': 'dashboard-activity' },
})
export class ActivitySection {
  readonly days = input.required<readonly ActivityDay[]>();
  readonly months = input.required<readonly ActivityMonth[]>();

  private readonly grid = viewChild<ElementRef<HTMLElement>>('grid');

  /** The day labels, then 52 weeks of cells. */
  protected readonly gridColumns = '1.75rem repeat(52, 0.625rem)';
  /** The month labels, then 7 days of cells. */
  protected readonly gridRows = '0.875rem repeat(7, 0.625rem)';
  protected readonly shades = SHADES;
  protected readonly iconColors = ICON_COLORS;
  protected readonly shownMonthCount = signal(MONTH_STEP);
  protected readonly openEntryId = signal<string | undefined>(undefined);

  protected readonly total = computed(() => this.days().reduce((sum, day) => sum + day.steps, 0));
  protected readonly totalText = computed(() => `${minisLabel(this.total())} moved a step in the last year`);
  /** Each day with its shade, by its share of the busiest day. */
  protected readonly cells = computed(() => {
    const busiest = Math.max(1, ...this.days().map((day) => day.steps));

    return this.days().map((day) => ({
      ...day,
      shade: SHADES[day.steps === 0 ? 0 : Math.ceil((day.steps / busiest) * 4)],
      label: `${day.steps === 0 ? 'No' : day.steps} ${day.steps === 1 ? 'step' : 'steps'} on ${day.date}`,
    }));
  });
  /** Per week with a first of a month, its short name, at the column of that week. */
  protected readonly monthLabels = computed(() =>
    this.days().flatMap((day, index) =>
      index % 7 === 0 && Number(day.date.slice(8)) <= 7
        ? {
            column: index / 7 + 1,
            label: new Date(`${day.date}T12:00`).toLocaleDateString('en', { month: 'short' }),
          }
        : [],
    ),
  );
  protected readonly shownMonths = computed(() => this.months().slice(0, this.shownMonthCount()));
  protected readonly hasMoreMonths = computed(() => this.shownMonthCount() < this.months().length);

  constructor() {
    // The newest week is on the right; narrow screens start there.
    afterNextRender(() => {
      const grid = this.grid()?.nativeElement;

      if (grid) {
        grid.scrollLeft = grid.scrollWidth;
      }
    });
  }

  protected toggle(id: string): void {
    this.openEntryId.update((open) => (open === id ? undefined : id));
  }

  protected showMore(): void {
    this.shownMonthCount.update((count) => count + MONTH_STEP);
  }
}
