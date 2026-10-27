import { computed, signal } from '@angular/core';
import { toggled } from '../../util/selection';

/**
 * Minis selected one by one to act on together, as in photo apps: selection mode lasts while at
 * least one is selected, "Done" ends it (docs/screens/hoard.md, Behavior).
 */
export class MiniSelection {
  readonly selectedIds = signal<ReadonlySet<string>>(new Set());
  readonly isSelecting = computed(() => this.selectedIds().size > 0);

  /** Ends selection mode; nothing stays selected. */
  finish(): void {
    this.selectedIds.set(new Set());
  }

  select(id: string, isSelected: boolean): void {
    this.selectedIds.update((ids) => toggled(ids, id, isSelected));
  }

  selectAll(ids: readonly string[]): void {
    this.selectedIds.set(new Set(ids));
  }
}
