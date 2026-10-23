import { computed, Injectable, signal } from '@angular/core';
import { isPainted } from '@greyhoarder/domain/hoard';
import { matchesFilter } from '../util/mini-filter';
import { countMinis, type MiniRow } from '../util/mini-row';
import { matchesSearch } from '../util/mini-search';
import { sortRows } from '../util/mini-sort';
import { toggled } from '../util/selection';
import { SAMPLE_MINIS } from './sample-minis';

/** The minis of the hoard with the search, filters and selection of the Minis tab. */
@Injectable({ providedIn: 'root' })
export class MinisStore {
  readonly rows = signal<readonly MiniRow[]>(SAMPLE_MINIS).asReadonly();

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
    countMinis(this.rows().filter((row) => isPainted(row.status))),
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
