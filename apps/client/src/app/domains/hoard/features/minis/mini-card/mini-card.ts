import { Component, computed, input, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideEllipsisVertical } from '@ng-icons/lucide';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { HlmButton } from '@spartan-ng/helm/button';
import type { MiniRow } from '../../../data/mini-row';
import { RowCheck } from '../../../ui/row-check/row-check';
import { minisLabel } from '../../../util/kit-labels';
import { StatusBadge } from '../../../ui/status-badge/status-badge';

/**
 * One row of alike minis as a card: what they are, where they come from, their status
 * and how many. A round check on the photo selects the row; it shows on hover
 * and keyboard focus, and on every row while the list is in selection mode.
 */
@Component({
  selector: 'app-mini-card',
  imports: [NgIcon, HlmBadge, HlmButton, RowCheck, StatusBadge],
  providers: [provideIcons({ lucideEllipsisVertical })],
  templateUrl: './mini-card.html',
  host: {
    class: 'group flex items-center gap-4 rounded-xl border bg-card p-4 transition-colors',
    '[class.border-primary/60]': 'isSelected()',
    '[class.cursor-pointer]': 'isSelectionMode()',
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

  /** Factions and box, e.g. "Orks · Boyz (2026)". */
  protected readonly origin = computed(() => {
    const { factions, box } = this.row();
    return [factions.join(', '), box ?? 'Without box'].join(' · ');
  });

  protected readonly parts = computed(() => this.row().parts.join(', '));

  /** Outside selection mode a click will open the row for editing, once that exists. */
  protected onRowClick(): void {
    if (this.isSelectionMode()) {
      this.selectedChange.emit(!this.isSelected());
    }
  }
}
