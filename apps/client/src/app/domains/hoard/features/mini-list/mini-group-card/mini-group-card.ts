import { Component, computed, input, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronDown } from '@ng-icons/lucide';
import type { HoardGroup } from '../../../application/minis/hoard-group';
import type { MiniRow } from '../../../application/minis/mini-row';
import { EitherOrName } from '../../../ui/either-or-name/either-or-name';
import { LongPress } from '../../../ui/long-press/long-press';
import {
  PROGRESS_STATUSES,
  ProgressBar,
  STATUS_COLORS,
} from '../../../ui/progress-bar/progress-bar';
import { eitherOrText } from '../../../util/either-or';
import { minisLabel } from '../../../util/kit-labels';
import { STATUS_LABELS } from '../../../util/status-labels';
import { MiniCard } from '../mini-card/mini-card';
import type { RowSelection } from '../mini-table/mini-table';

/** Tells the cards' lists apart for `aria-controls`. */
let nextId = 0;

/**
 * Minis with the same name, factions and parts from any box as a card that opens to list each of
 * them; only single minis are selected and opened (docs/screens/hoard.md).
 */
@Component({
  selector: 'app-mini-group-card',
  imports: [NgIcon, EitherOrName, LongPress, ProgressBar, MiniCard],
  providers: [provideIcons({ lucideChevronDown })],
  templateUrl: './mini-group-card.html',
  host: {
    class: 'block rounded-xl border bg-card transition-colors',
    '[class.border-primary/60]': 'hasSelected()',
    '[attr.data-testid]': '"hoard-group"',
  },
})
export class MiniGroupCard {
  readonly group = input.required<HoardGroup>();
  readonly isOpen = input(false);
  readonly isSelectionMode = input(false);
  readonly selectedIds = input<ReadonlySet<string>>(new Set());
  readonly toggled = output();
  readonly selectedChange = output<RowSelection>();
  readonly opened = output<MiniRow>();

  protected readonly listId = `hoard-group-${nextId++}-minis`;
  protected readonly count = computed(() => this.group().rows.length);
  protected readonly minisLabel = minisLabel;
  protected readonly statusColor = STATUS_COLORS;
  protected readonly hasSelected = computed(() =>
    this.group().rows.some((row) => this.selectedIds().has(row.id)),
  );

  /** Factions and box, e.g. "Orks · Boyz (2026)", or "Orks · 2 boxes". */
  protected readonly origin = computed(() => {
    const { factions, boxes } = this.group();
    const [box] = boxes;
    const from =
      boxes.length > 1
        ? `${boxes.length} boxes`
        : box === undefined
          ? 'Without box'
          : eitherOrText(box);
    return [factions.join(', '), from].filter((text) => text !== '').join(' · ');
  });
  /** The statuses the group has, in pipeline order, with their counts. */
  protected readonly legend = computed(() =>
    PROGRESS_STATUSES.flatMap((status) => {
      const count = this.group().counts[status] ?? 0;
      return count > 0 ? [{ status, count, label: STATUS_LABELS[status] }] : [];
    }),
  );
}
