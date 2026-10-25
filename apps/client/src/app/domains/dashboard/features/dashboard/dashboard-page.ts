import { Component, inject } from '@angular/core';
import { type HobbyStatus, hobbyStatuses } from '@greyhoarder/domain/hoard';
import { HlmSkeleton } from '@spartan-ng/helm/skeleton';
import { CurrentSession } from '../../../auth/api';
import { type FactionOverview, HoardByFaction, STATUS_LABELS } from '../../../hoard/api';

/** The dots of a card, from the furthest status to the sprue. */
const DOT_ORDER: readonly HobbyStatus[] = [...hobbyStatuses].reverse();

/** Where signed-in users land; specified in docs/screens/dashboard.md. */
@Component({
  selector: 'app-dashboard-page',
  imports: [HlmSkeleton],
  templateUrl: './dashboard-page.html',
  host: { class: 'flex w-full flex-col gap-10 p-4 sm:p-8 lg:p-10' },
})
export class DashboardPage {
  protected readonly user = inject(CurrentSession).user;
  protected readonly hoard = inject(HoardByFaction);

  /** The sections whose content does not exist yet. */
  protected readonly upcomingSections = [
    { id: 'activity', title: 'Activity' },
    { id: 'workbench', title: 'On the workbench' },
  ] as const;

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
