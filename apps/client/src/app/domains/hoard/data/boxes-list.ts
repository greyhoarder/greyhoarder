import { computed, inject, Injectable, signal } from '@angular/core';
import { matchesBoxFilter, matchesBoxSearch } from './box-filter';
import { toBoxRows } from './box-row';
import { sortBoxes } from './box-sort';
import { BoxesStore } from './boxes-store';
import { FactionNamesStore } from './faction-names-store';
import { MinisStore } from './minis-store';
import { toggled } from '../util/selection';

/**
 * The boxes of the hoard as the Boxes tab lists them, with its search, filters and selection;
 * shared with the frame of the hoard, whose "Select" acts on the open tab.
 */
@Injectable({ providedIn: 'root' })
export class BoxesList {
  private readonly boxesStore = inject(BoxesStore);
  private readonly minisStore = inject(MinisStore);
  private readonly factionNames = inject(FactionNamesStore);

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

  /** "Select" was pressed; selecting a box by its check starts the mode as well. */
  private readonly isSelectStarted = signal(false);
  readonly selectedIds = signal<ReadonlySet<string>>(new Set());
  readonly isSelecting = computed(() => this.isSelectStarted() || this.selectedIds().size > 0);

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
