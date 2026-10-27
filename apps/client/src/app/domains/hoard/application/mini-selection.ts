import { computed, signal } from '@angular/core';
import { toggled } from '../util/selection';

/**
 * Minis selected one by one to act on together, as in photo apps: "Select" or a ticked check starts
 * selection mode, "Done" ends it (docs/screens/hoard.md, Behavior).
 */
export class MiniSelection {
  /** "Select" was pressed; ticking a check starts the mode as well. */
  private readonly isStarted = signal(false);
  readonly selectedIds = signal<ReadonlySet<string>>(new Set());
  readonly isSelecting = computed(() => this.isStarted() || this.selectedIds().size > 0);

  start(): void {
    this.isStarted.set(true);
  }

  /** Ends selection mode; nothing stays selected. */
  finish(): void {
    this.isStarted.set(false);
    this.selectedIds.set(new Set());
  }

  select(id: string, isSelected: boolean): void {
    this.selectedIds.update((ids) => toggled(ids, id, isSelected));
  }

  selectAll(ids: readonly string[]): void {
    this.selectedIds.set(new Set(ids));
  }
}
