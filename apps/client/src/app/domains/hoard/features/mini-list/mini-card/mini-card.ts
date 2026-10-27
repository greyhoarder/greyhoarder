import { Component, input, output } from '@angular/core';
import { HlmBadge } from '@spartan-ng/helm/badge';
import type { MiniRow } from '../../../application/minis/mini-row';
import { RowCheck } from '../../../ui/row-check/row-check';
import { GoneBadge } from '../../../ui/gone-badge/gone-badge';
import { StatusBadge } from '../../../ui/status-badge/status-badge';
import { EitherOrName } from '../../../ui/either-or-name/either-or-name';

/**
 * One mini as a line of an open group card: what it is, its box and its status. A round
 * check on the photo selects it; it shows on hover and keyboard focus, and on every mini while the
 * list is in selection mode.
 */
@Component({
  selector: 'app-mini-card',
  imports: [EitherOrName, HlmBadge, RowCheck, GoneBadge, StatusBadge],
  templateUrl: './mini-card.html',
  host: {
    class: 'group flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors',
    '[class.bg-primary/5]': 'isSelected()',
    '[attr.data-testid]': '"hoard-row"',
    '(click)': 'onRowClick()',
  },
})
export class MiniCard {
  readonly row = input.required<MiniRow>();

  /** In selection mode every check shows, and clicking the line selects it. */
  readonly isSelectionMode = input(false);
  readonly isSelected = input(false);
  readonly selectedChange = output<boolean>();
  /** Outside selection mode a click opens the mini. */
  readonly opened = output();

  protected onRowClick(): void {
    if (this.isSelectionMode()) {
      this.selectedChange.emit(!this.isSelected());
    } else {
      this.opened.emit();
    }
  }
}
