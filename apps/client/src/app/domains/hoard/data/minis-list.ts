import { computed, inject, Injectable, signal } from '@angular/core';
import { hasReached } from '@greyhoarder/domain/hoard';
import { toggled } from '../util/selection';
import { BoxesStore } from './boxes-store';
import { FactionNamesStore } from './faction-names-store';
import { matchesFilter } from './mini-filter';
import { countMinis, toMiniRows } from './mini-row';
import { matchesSearch } from './mini-search';
import { sortRows } from './mini-sort';
import { MinisStore } from './minis-store';
import { PartsStore } from './parts-store';

/**
 * The minis of the hoard as the Minis tab lists them, alike ones as one row, with its search,
 * filters and selection; shared with the frame of the hoard, which shows the counts.
 */
@Injectable({ providedIn: 'root' })
export class MinisList {
  private readonly minisStore = inject(MinisStore);
  private readonly boxesStore = inject(BoxesStore);
  private readonly factionNames = inject(FactionNamesStore);
  private readonly partsStore = inject(PartsStore);

  readonly rows = computed(() =>
    toMiniRows(
      this.minisStore.minis(),
      this.boxesStore.boxes(),
      this.factionNames.names(),
      this.partsStore.names(),
    ),
  );

  readonly isLoading = computed(() => this.minisStore.isLoading() || this.boxesStore.isLoading());
  readonly hasFailed = computed(() => this.minisStore.hasFailed() || this.boxesStore.hasFailed());

  readonly query = signal('');
  readonly factionFilter = signal<ReadonlySet<string>>(new Set());
  readonly statusFilter = signal<ReadonlySet<string>>(new Set());
  readonly boxFilter = signal<ReadonlySet<string>>(new Set());
  readonly isFiltered = computed(() =>
    [this.factionFilter(), this.statusFilter(), this.boxFilter()].some((filter) => filter.size > 0),
  );
  /** A search or filter hides some rows. */
  readonly isNarrowed = computed(() => this.query().trim() !== '' || this.isFiltered());

  /** Sorted by army; the table sorts by its own headers. */
  readonly visibleRows = computed(() =>
    sortRows(
      this.rows().filter(
        (row) =>
          matchesSearch(row, this.query()) &&
          matchesFilter(row, {
            factions: this.factionFilter(),
            statuses: this.statusFilter(),
            boxes: this.boxFilter(),
          }),
      ),
      'army',
      'ascending',
    ),
  );

  readonly miniCount = computed(() => countMinis(this.rows()));
  readonly visibleMiniCount = computed(() => countMinis(this.visibleRows()));
  readonly paintedCount = computed(() =>
    countMinis(this.rows().filter((row) => hasReached(row.status, 'painted'))),
  );

  /** "Select" was pressed; selecting a row by its check starts the mode as well. */
  private readonly isSelectStarted = signal(false);
  readonly selectedIds = signal<ReadonlySet<string>>(new Set());
  readonly isSelecting = computed(() => this.isSelectStarted() || this.selectedIds().size > 0);
  readonly selectedCount = computed(() =>
    countMinis(this.rows().filter((row) => this.selectedIds().has(row.id))),
  );

  resetFilters(): void {
    for (const filter of [this.factionFilter, this.statusFilter, this.boxFilter]) {
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
    this.selectedIds.set(new Set(this.visibleRows().map((row) => row.id)));
  }

  select(id: string, isSelected: boolean): void {
    this.selectedIds.update((ids) => toggled(ids, id, isSelected));
  }
}
