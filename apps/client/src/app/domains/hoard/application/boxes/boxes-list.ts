import { computed, inject, Injectable, signal } from '@angular/core';
import { matchesBoxFilter, matchesBoxSearch } from './box-filter';
import { toBoxRows } from './box-row';
import { sortBoxes } from './box-sort';
import { BoxesStore } from '../../data/boxes-store';
import { FactionNames } from '../faction-names';
import { MinisStore } from '../../data/minis-store';
import { toggled } from '../../util/selection';

/**
 * The boxes of the hoard as the Boxes tab lists them, with its search, filters and selection;
 * shared with the frame of the hoard, which shows the count.
 */
@Injectable({ providedIn: 'root' })
export class BoxesList {
  private readonly boxesStore = inject(BoxesStore);
  private readonly minisStore = inject(MinisStore);
  private readonly factionNames = inject(FactionNames);

  readonly boxes = computed(() =>
    toBoxRows(this.boxesStore.boxes(), this.minisStore.minis(), this.factionNames.names()),
  );

  readonly isLoading = computed(() => this.boxesStore.isLoading() || this.minisStore.isLoading());
  readonly hasFailed = computed(() => this.boxesStore.hasFailed() || this.minisStore.hasFailed());

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

  readonly selectedIds = signal<ReadonlySet<string>>(new Set());
  /** Selection mode lasts while at least one box is selected. */
  readonly isSelecting = computed(() => this.selectedIds().size > 0);

  resetFilters(): void {
    for (const filter of [this.factionFilter, this.progressFilter, this.tagFilter]) {
      filter.set(new Set());
    }
  }

  /** Ends selection mode; nothing stays selected. */
  finishSelecting(): void {
    this.selectedIds.set(new Set());
  }

  selectAll(): void {
    this.selectedIds.set(new Set(this.visibleBoxes().map((box) => box.id)));
  }

  select(id: string, isSelected: boolean): void {
    this.selectedIds.update((ids) => toggled(ids, id, isSelected));
  }
}
