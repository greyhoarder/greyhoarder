import { computed, Injectable, signal } from '@angular/core';
import { matchesBoxFilter, matchesBoxSearch } from '../util/box-filter';
import type { BoxRow } from '../util/box-row';
import { sortBoxes } from '../util/box-sort';
import { toggled } from '../util/selection';
import { SAMPLE_BOXES } from './sample-boxes';

/** The boxes of the hoard with the search, filters and selection of the Boxes tab. */
@Injectable({ providedIn: 'root' })
export class BoxesStore {
  private readonly allBoxes = signal<readonly BoxRow[]>(SAMPLE_BOXES);
  readonly boxes = this.allBoxes.asReadonly();

  readonly query = signal('');
  readonly factionFilter = signal<ReadonlySet<string>>(new Set());
  readonly progressFilter = signal<ReadonlySet<string>>(new Set());
  readonly tagFilter = signal<ReadonlySet<string>>(new Set());
  readonly isFiltered = computed(() =>
    [this.factionFilter(), this.progressFilter(), this.tagFilter()].some(
      (filter) => filter.size > 0,
    ),
  );

  /** Newest first; the table sorts by its own headers. */
  readonly visibleBoxes = computed(() =>
    sortBoxes(
      this.boxes().filter(
        (box) =>
          matchesBoxSearch(box, this.query()) &&
          matchesBoxFilter(box, {
            factions: this.factionFilter(),
            progresses: this.progressFilter(),
            tags: this.tagFilter(),
          }),
      ),
      'added',
      'descending',
    ),
  );

  /** "Select" was pressed; selecting a box by its check starts the mode as well. */
  private readonly isSelectStarted = signal(false);
  readonly selectedIds = signal<ReadonlySet<string>>(new Set());
  readonly isSelecting = computed(() => this.isSelectStarted() || this.selectedIds().size > 0);

  add(boxes: readonly BoxRow[]): void {
    this.allBoxes.update((current) => [...current, ...boxes]);
  }

  resetFilters(): void {
    for (const filter of [this.factionFilter, this.progressFilter, this.tagFilter]) {
      filter.set(new Set());
    }
  }

  startSelecting(): void {
    this.isSelectStarted.set(true);
  }

  /** Ends selection mode; nothing stays selected. */
  finishSelecting(): void {
    this.isSelectStarted.set(false);
    this.selectedIds.set(new Set());
  }

  selectAll(): void {
    this.selectedIds.set(new Set(this.visibleBoxes().map((box) => box.id)));
  }

  select(id: string, isSelected: boolean): void {
    this.selectedIds.update((ids) => toggled(ids, id, isSelected));
  }
}
