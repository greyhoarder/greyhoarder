import { Component, computed, inject, signal } from '@angular/core';
import { type HobbyStatus, hobbyStatuses } from '@greyhoarder/domain/hoard';
import { shownName } from '@greyhoarder/domain/users';
import { HlmSkeleton } from '@spartan-ng/helm/skeleton';
import { CurrentSession } from '../../../auth/api';
import { type FactionOverview, HoardActivity, HoardByFaction, STATUS_LABELS } from '../../../hoard/api';
import { ActivitySection } from './activity-section/activity-section';
import { activityDays, activityMonths, activitySummary, activityYears } from './activity-section/activity';

/** The dots of a card, from the furthest status to the sprue. */
const DOT_ORDER: readonly HobbyStatus[] = [...hobbyStatuses].reverse();

/** Where signed-in users land; specified in docs/screens/dashboard.md. */
@Component({
  selector: 'app-dashboard-page',
  imports: [HlmSkeleton, ActivitySection],
  providers: [HoardActivity],
  templateUrl: './dashboard-page.html',
  host: { class: 'flex w-full flex-col gap-10 p-4 sm:p-8 lg:p-10' },
})
export class DashboardPage {
  private readonly user = inject(CurrentSession).user;
  protected readonly name = computed(() => {
    const user = this.user();

    return user && shownName(user);
  });
  protected readonly hoard = inject(HoardByFaction);
  protected readonly activity = inject(HoardActivity);
  protected readonly activityYear = signal(new Date().getFullYear());
  protected readonly activityYears = computed(() =>
    activityYears({ days: this.activity.days(), months: this.activity.months() }, new Date()),
  );
  protected readonly activityDays = computed(() => activityDays(this.activity.days(), this.activityYear()));
  protected readonly activitySummary = computed(() =>
    activitySummary(this.activity.months(), this.activityDays(), this.activityYear(), new Date()),
  );
  protected readonly activityMonths = computed(() => activityMonths(this.activity.months(), this.activityYear()));

  /** The sections whose content does not exist yet. */
  protected readonly upcomingSections = [{ id: 'workbench', title: 'On the workbench' }] as const;

  protected readonly legend = hobbyStatuses;
  protected readonly statusLabels = STATUS_LABELS;

  /** The colors of the status badges in the hoard. */
  protected readonly dotClasses: Readonly<Record<HobbyStatus, string>> = {
    sprue: 'bg-muted',
    built: 'bg-muted-foreground/40',
    primed: 'bg-muted-foreground/70',
    painted: 'bg-primary/60',
    done: 'bg-primary',
  };

  protected minisLine(miniCount: number, paintedCount: number): string {
    return `${miniCount === 1 ? '1 mini' : `${miniCount} minis`} · ${paintedCount} painted`;
  }

  protected dotsOf(faction: FactionOverview): HobbyStatus[] {
    return DOT_ORDER.flatMap((status) => Array<HobbyStatus>(faction.statusCounts[status]).fill(status));
  }

  protected dotsLabel(faction: FactionOverview): string {
    return hobbyStatuses
      .map((status) => `${faction.statusCounts[status]} ${STATUS_LABELS[status].toLowerCase()}`)
      .join(', ');
  }
}
