import { Component, computed, input } from '@angular/core';
import { type HobbyStatus, hobbyStatuses } from '@greyhoarder/domain/hoard';
import { STATUS_SHORT_LABELS } from '../../util/status-labels';

/** How many minis of a box stand at each status. */
interface StatusCounts {
  readonly minis: Readonly<Partial<Record<HobbyStatus, number>>>;
}

interface Segment {
  readonly status: HobbyStatus;
  readonly share: number;
}

/**
 * A bar over all minis of a box, split by status in the order of the hobby
 * pipeline and aligned right, so done ends on the right; minis still on the
 * sprue are the empty background on the left. Names the counts for a tooltip
 * and screen readers.
 */
@Component({
  selector: 'app-progress-bar',
  template: `
    <div
      class="flex h-2 w-full justify-end gap-0.5 overflow-hidden rounded-full bg-muted"
      role="img"
      [attr.aria-label]="description()"
      [title]="description()"
    >
      @for (segment of segments(); track segment.status) {
        <div
          class="h-full"
          [attr.data-status]="segment.status"
          [class]="statusColor[segment.status]"
          [style.width.%]="segment.share"
        ></div>
      }
    </div>
  `,
  host: { class: 'block' },
})
export class ProgressBar {
  readonly box = input.required<StatusCounts>();

  protected readonly statusColor = STATUS_COLORS;

  protected readonly segments = computed<Segment[]>(() => {
    const box = this.box();
    const total = hobbyStatuses.reduce((sum, status) => sum + (box.minis[status] ?? 0), 0);
    return PROGRESS_STATUSES.filter((status) => (box.minis[status] ?? 0) > 0).map((status) => ({
      status,
      share: ((box.minis[status] ?? 0) / total) * 100,
    }));
  });

  /** E.g. "5 primed, 5 done". */
  protected readonly description = computed(() => {
    const box = this.box();
    return PROGRESS_STATUSES.filter((status) => (box.minis[status] ?? 0) > 0)
      .map((status) => `${box.minis[status]} ${STATUS_SHORT_LABELS[status]}`)
      .join(', ');
  });
}

/** The statuses that count as progress; the sprue is where every mini starts. */
export const PROGRESS_STATUSES: readonly HobbyStatus[] = hobbyStatuses.filter((status) => status !== 'sprue');

/** Grey getting lighter towards primed, gold once painted, like the status badges. */
export const STATUS_COLORS: Readonly<Record<HobbyStatus, string>> = {
  sprue: 'bg-muted',
  built: 'bg-muted-foreground/45',
  primed: 'bg-muted-foreground/75',
  painted: 'bg-primary/60',
  done: 'bg-primary',
};
