import { computed, Injectable, signal } from '@angular/core';
import { hasReached } from '../models/hobby-status';
import { matchesFilter } from '../models/mini-filter';
import { countMinis, type MiniRow } from '../models/mini-row';
import { matchesSearch } from '../models/mini-search';
import { sortRows } from '../models/mini-sort';
import { toggled } from '../util/selection';
import { SAMPLE_MINIS } from './sample-minis';

/** The minis of the hoard with the search, filters and selection of the Minis tab. */
@Injectable({ providedIn: 'root' })
export class MinisStore {
  private readonly allRows = signal<readonly MiniRow[]>(SAMPLE_MINIS);
  readonly rows = this.allRows.asReadonly();

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

  add(rows: readonly MiniRow[]): void {
    this.allRows.update((current) => [...current, ...rows]);
  }

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
