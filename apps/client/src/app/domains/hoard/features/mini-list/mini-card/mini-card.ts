import { Component, computed, input, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideEllipsisVertical } from '@ng-icons/lucide';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { HlmButton } from '@spartan-ng/helm/button';
import type { MiniRow } from '../../../data/mini-row';
import { RowCheck } from '../../../ui/row-check/row-check';
import { minisLabel } from '../../../util/kit-labels';
import { StatusBadge } from '../../../ui/status-badge/status-badge';
import { eitherOrText } from '../../../util/either-or';
import { EitherOrName } from '../../../ui/either-or-name/either-or-name';

/**
 * One row of alike minis as a card: what they are, where they come from, their status
 * and how many. A round check on the photo selects the row; it shows on hover
 * and keyboard focus, and on every row while the list is in selection mode.
 */
@Component({
  selector: 'app-mini-card',
  imports: [EitherOrName, NgIcon, HlmBadge, HlmButton, RowCheck, StatusBadge],
  providers: [provideIcons({ lucideEllipsisVertical })],
  templateUrl: './mini-card.html',
  host: {
    class:
      'group flex cursor-pointer items-center gap-4 rounded-xl border bg-card p-4 transition-colors',
    '[class.border-primary/60]': 'isSelected()',
    '[attr.data-testid]': '"hoard-row"',
    '(click)': 'onRowClick()',
  },
})
export class MiniCard {
  readonly row = input.required<MiniRow>();

  /** "1 mini" or "{n} minis", for screen readers. */
  protected readonly minisLabel = minisLabel;
  /** In selection mode every check shows, and clicking the row selects it. */
  readonly isSelectionMode = input(false);
  readonly isSelected = input(false);
  readonly selectedChange = output<boolean>();
  /** Outside selection mode a click opens the row. */
  readonly opened = output();

  /** Factions and box, e.g. "Orks · Boyz (2026)". */
  protected readonly origin = computed(() => {
    const { factions, box } = this.row();
    return [factions.join(', '), box === undefined ? 'Without box' : eitherOrText(box)].join(' · ');
  });

  protected readonly parts = computed(() => this.row().parts.join(', '));

  protected onRowClick(): void {
    if (this.isSelectionMode()) {
      this.selectedChange.emit(!this.isSelected());
    } else {
      this.opened.emit();
    }
  }
}
