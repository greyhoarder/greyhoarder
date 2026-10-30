import { Component, computed, input, output, signal } from '@angular/core';
import { type HobbyStatus } from '@greyhoarder/domain/hoard';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronDown } from '@ng-icons/lucide';
import { HlmBadge } from '@spartan-ng/helm/badge';
import type { MiniGroup } from '../mini-group';
import { EitherOrName } from '../../../ui/either-or-name/either-or-name';
import { LongPress } from '../../../ui/long-press/long-press';
import { RowCheck } from '../../../ui/row-check/row-check';
import { PROGRESS_STATUSES, ProgressBar, STATUS_COLORS } from '../../../ui/progress-bar/progress-bar';
import { minisLabel } from '../../../util/kit-labels';
import { STATUS_LABELS } from '../../../util/status-labels';

/** Tells the cards' lists apart for `aria-controls`. */
let nextId = 0;

/** A status chosen for one mini of the group. */
export interface StatusChoice {
  readonly miniId: string;
  readonly status: HobbyStatus;
}

/** One mini of the group selected or deselected. */
export interface MiniSelectionChange {
  readonly miniId: string;
  readonly isSelected: boolean;
}

/**
 * Built minis of a box with the same name, parts and factions as a card that opens to show each
 * of them with its status, which can be chosen there; each mini can be selected by its check.
 */
@Component({
  selector: 'app-box-group-card',
  imports: [NgIcon, HlmBadge, EitherOrName, LongPress, ProgressBar, RowCheck],
  providers: [provideIcons({ lucideChevronDown })],
  templateUrl: './box-group-card.html',
  host: {
    class: 'block rounded-xl border bg-card',
    '[attr.data-testid]': '"box-group"',
  },
})
export class BoxGroupCard {
  readonly group = input.required<MiniGroup>();
  /** Factions are shown only when they differ from these. */
  readonly boxFactions = input.required<readonly string[]>();
  readonly statusChosen = output<StatusChoice>();
  readonly miniOpened = output<string>();
  /** In selection mode every check shows, and clicking a mini's line selects it. */
  readonly isSelectionMode = input(false);
  readonly selectedIds = input<ReadonlySet<string>>(new Set());
  readonly selectedChange = output<MiniSelectionChange>();

  protected readonly isOpen = signal(false);

  protected readonly listId = `box-group-${nextId++}-minis`;
  protected readonly count = computed(() => this.group().minis.length);
  protected readonly minisLabel = minisLabel;
  protected readonly statusColor = STATUS_COLORS;
  /** Built to done, as the control offers them. */
  protected readonly statuses = PROGRESS_STATUSES.map((status) => ({
    status,
    label: STATUS_LABELS[status],
  }));

  /** Factions that differ from the box first, then the parts. */
  protected readonly chips = computed(() => {
    const { factions, parts } = this.group();
    const boxFactions = this.boxFactions();
    const isLikeBox =
      factions.length === boxFactions.length && factions.every((faction) => boxFactions.includes(faction));
    return [...(isLikeBox ? [] : factions), ...parts];
  });
  /** The statuses the group has, in pipeline order, with their counts. */
  protected readonly legend = computed(() =>
    PROGRESS_STATUSES.flatMap((status) => {
      const count = this.group().counts[status] ?? 0;
      return count > 0 ? [{ status, count, label: STATUS_LABELS[status] }] : [];
    }),
  );

  protected toggle(): void {
    this.isOpen.update((isOpen) => !isOpen);
  }

  /** In selection mode a click on a mini's line selects it; otherwise it opens the mini. */
  protected onMiniClick(miniId: string): void {
    if (this.isSelectionMode()) {
      this.selectedChange.emit({ miniId, isSelected: !this.selectedIds().has(miniId) });
    } else {
      this.miniOpened.emit(miniId);
    }
  }
}
