import { computed, inject, Injectable, signal } from '@angular/core';
import { hasReached, isGone } from '@greyhoarder/domain/hoard';
import { toggled } from '../../util/selection';
import { MiniSelection } from './mini-selection';
import { BoxesStore } from '../../data/boxes-store';
import { FactionNames } from '../faction-names';
import { matchesFilter } from './mini-filter';
import { toHoardGroups } from './hoard-group';
import { countMinis, type MiniRow, toSingleRows } from './mini-row';
import { factionLineage } from '../../models/faction-lineage';
import { matchesSearch } from './mini-search';
import { sortRows } from './mini-sort';
import { MinisStore } from '../../data/minis-store';
import { PartsStore } from '../../data/parts-store';

/**
 * The minis of the hoard past the sprue as the Minis tab lists them, each as a row of its own and
 * in groups, with its search, filters, selection and open groups; shared with the frame of the
 * hoard, which shows the counts.
 */
@Injectable({ providedIn: 'root' })
export class MinisList {
  private readonly minisStore = inject(MinisStore);
  private readonly boxesStore = inject(BoxesStore);
  private readonly factionNames = inject(FactionNames);
  private readonly partsStore = inject(PartsStore);

  /** Minis on the sprue of a box are built on their box; those without a box are listed (docs/domains/hoard.md). */
  readonly rows = computed(() =>
    toSingleRows(
      this.minisStore.minis().filter((mini) => mini.status !== 'sprue' || mini.boxId === undefined),
      this.boxesStore.boxes(),
      this.factionNames.names(),
      this.partsStore.names(),
    ),
  );

  /** The rows of minis that are not gone. */
  readonly presentRows = computed(() => this.rows().filter((row) => !isGone(row)));

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
            partOf: this.factionNames.partOfByName(),
            statuses: this.statusFilter(),
            boxes: this.boxFilter(),
          }),
      ),
      'army',
      'ascending',
    ),
  );

  /** The groups of the visible rows, in their order. */
  readonly visibleGroups = computed(() => toHoardGroups(this.visibleRows()));

  /** Every mini that is not gone, on the sprue or not; for the summary. */
  readonly ownedCount = computed(() => this.minisStore.minis().filter((mini) => !isGone(mini)).length);
  readonly miniCount = computed(() => countMinis(this.presentRows()));
  readonly visibleMiniCount = computed(() => countMinis(this.visibleRows()));
  readonly paintedCount = computed(() =>
    countMinis(this.presentRows().filter((row) => hasReached(row.status, 'painted'))),
  );

  /** The factions a row counts for in the faction filter: its own and those they are part of. */
  factionLineageOf(row: MiniRow): string[] {
    return factionLineage(row.factions, this.factionNames.partOfByName());
  }

  /** Group cards stay open while the search or the filters change, and when coming back. */
  readonly openGroupIds = signal<ReadonlySet<string>>(new Set());

  private readonly selection = new MiniSelection();
  readonly selectedIds = this.selection.selectedIds.asReadonly();
  readonly isSelecting = this.selection.isSelecting;
  readonly selectedCount = computed(() => countMinis(this.rows().filter((row) => this.selectedIds().has(row.id))));

  resetFilters(): void {
    for (const filter of [this.factionFilter, this.statusFilter, this.boxFilter]) {
      filter.set(new Set());
    }
  }

  /** Ends selection mode; nothing stays selected. */
  finishSelecting(): void {
    this.selection.finish();
  }

  selectAll(): void {
    this.selection.selectAll(this.visibleRows().map((row) => row.id));
  }

  toggleGroup(id: string): void {
    this.openGroupIds.update((ids) => toggled(ids, id, !ids.has(id)));
  }

  select(id: string, isSelected: boolean): void {
    this.selection.select(id, isSelected);
  }
}
