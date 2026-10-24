import { Component, computed, input, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideEllipsisVertical } from '@ng-icons/lucide';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { HlmButton } from '@spartan-ng/helm/button';
import { kitLine } from '../../../util/box-labels';
import { percentOf, progressOf } from '../../../data/box-row';
import { formatDate } from '../../../util/format-date';
import type { BoxRow } from '../../../data/box-row';
import { STATUS_SHORT_LABELS } from '../../../util/status-labels';
import { ProgressBadge } from '../progress-badge/progress-badge';
import { PROGRESS_STATUSES, ProgressBar, STATUS_COLORS } from '../progress-bar/progress-bar';
import { RowCheck } from '../../../ui/row-check/row-check';

/** One box as a card: photo, kit, how far its minis have come, factions, date and tags. */
@Component({
  selector: 'app-box-card',
  imports: [NgIcon, HlmBadge, HlmButton, ProgressBadge, ProgressBar, RowCheck],
  providers: [provideIcons({ lucideEllipsisVertical })],
  templateUrl: './box-card.html',
  host: {
    class: 'group flex flex-col overflow-hidden rounded-xl border bg-card transition-colors',
    '[class.border-primary/60]': 'isSelected()',
    '[class.cursor-pointer]': 'isSelectionMode()',
    '[attr.data-testid]': '"hoard-box"',
    '(click)': 'onCardClick()',
  },
})
export class BoxCard {
  readonly box = input.required<BoxRow>();
  /** In selection mode every check shows, and clicking the card selects it. */
  readonly isSelectionMode = input(false);
  readonly isSelected = input(false);
  readonly selectedChange = output<boolean>();

  protected readonly progress = computed(() => progressOf(this.box()));
  protected readonly kitLine = computed(() => kitLine(this.box()));
  protected readonly percent = computed(() => percentOf(this.box()));
  protected readonly statusColor = STATUS_COLORS;
  /** Every status past the sprue in pipeline order with its count, also zero, so all cards read alike. */
  protected readonly statusCounts = computed(() =>
    PROGRESS_STATUSES.map((status) => ({
      status,
      count: this.box().minis[status] ?? 0,
      label: STATUS_SHORT_LABELS[status],
    })),
  );
  /** Factions and date, e.g. "Orks · added 12 Oct 2026". */
  protected readonly meta = computed(
    () => `${this.box().factions.join(', ')} · added ${formatDate(this.box().addedOn)}`,
  );

  /** Outside selection mode a click will open the box for editing, once that exists. */
  protected onCardClick(): void {
    if (this.isSelectionMode()) {
      this.selectedChange.emit(!this.isSelected());
    }
  }
}
