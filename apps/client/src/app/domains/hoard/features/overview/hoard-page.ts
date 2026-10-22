import { Component, computed, signal } from '@angular/core';
import { hobbyStatuses, isPainted } from '@greyhoarder/domain/hoard';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideCircleCheck,
  lucideList,
  lucidePlus,
  lucideRows2,
  lucideSearch,
  lucideX,
} from '@ng-icons/lucide';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmInputGroupImports } from '@spartan-ng/helm/input-group';
import { HlmTabsImports } from '@spartan-ng/helm/tabs';
import { SAMPLE_MINIS } from '../../data/sample-minis';
import { FilterChip, type FilterOption } from '../../ui/filter-chip/filter-chip';
import { MiniCard } from '../../ui/mini-card/mini-card';
import { MiniTable, type RowSelection } from '../../ui/mini-table/mini-table';
import { matchesFilter, NONE } from '../../util/mini-filter';
import type { MiniRow } from '../../util/mini-row';
import { matchesSearch } from '../../util/mini-search';
import { sortRows } from '../../util/mini-sort';
import { STATUS_LABELS } from '../../util/status-labels';

type View = 'cards' | 'table';

/** Overview of everything a user owns; specified in docs/screens/hoard.md. */
@Component({
  selector: 'app-hoard-page',
  imports: [
    NgIcon,
    HlmBadge,
    HlmButton,
    HlmInputGroupImports,
    HlmTabsImports,
    FilterChip,
    MiniCard,
    MiniTable,
  ],
  providers: [
    provideIcons({ lucideCircleCheck, lucideList, lucidePlus, lucideRows2, lucideSearch, lucideX }),
  ],
  templateUrl: './hoard-page.html',
  host: { class: 'mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 sm:p-8 lg:p-10' },
})
export class HoardPage {
  private readonly rows = signal<readonly MiniRow[]>(SAMPLE_MINIS);

  protected readonly tab = signal<'minis' | 'boxes'>('minis');
  protected readonly view = signal<View>('cards');
  protected readonly query = signal('');
  protected readonly factionFilter = signal<ReadonlySet<string>>(new Set());
  protected readonly statusFilter = signal<ReadonlySet<string>>(new Set());
  protected readonly boxFilter = signal<ReadonlySet<string>>(new Set());
  protected readonly isFiltered = computed(() =>
    [this.factionFilter(), this.statusFilter(), this.boxFilter()].some((filter) => filter.size > 0),
  );
  /** "Select" was pressed; selecting a row by its check starts the mode as well. */
  private readonly isSelectStarted = signal(false);
  protected readonly selectedIds = signal<ReadonlySet<string>>(new Set());

  protected readonly isSelecting = computed(
    () => this.isSelectStarted() || this.selectedIds().size > 0,
  );
  protected readonly selectedCount = computed(() =>
    countMinis(this.rows().filter((row) => this.selectedIds().has(row.id))),
  );

  protected readonly miniCount = computed(() => countMinis(this.rows()));
  protected readonly boxCount = computed(
    () => new Set(this.rows().flatMap((row) => (row.box ? [row.box] : []))).size,
  );
  protected readonly paintedCount = computed(() =>
    countMinis(this.rows().filter((row) => isPainted(row.status))),
  );

  protected readonly factionOptions = computed(() => optionsOf(this.rows(), (row) => row.factions));
  protected readonly statusOptions = computed<FilterOption[]>(() =>
    hobbyStatuses.map((status) => ({
      value: status,
      label: STATUS_LABELS[status],
      count: countMinis(this.rows().filter((row) => row.status === status)),
    })),
  );
  protected readonly boxOptions = computed(() =>
    optionsOf(this.rows(), (row) => [row.box ?? NONE], 'Without box'),
  );

  protected readonly visibleRows = computed(() =>
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
      // Cards keep this order; the table sorts by its own headers.
      'army',
      'ascending',
    ),
  );
  protected readonly visibleMiniCount = computed(() => countMinis(this.visibleRows()));
  /** Counted on the tab as "9 of 44" while a search or filter narrows the list. */
  protected readonly isNarrowed = computed(() => this.query().trim() !== '' || this.isFiltered());

  protected resetFilters(): void {
    for (const filter of [this.factionFilter, this.statusFilter, this.boxFilter]) {
      filter.set(new Set());
    }
  }

  protected startSelecting(): void {
    this.isSelectStarted.set(true);
  }

  /** Ends selection mode; the checks disappear and nothing stays selected. */
  protected finishSelecting(): void {
    this.isSelectStarted.set(false);
    this.selectedIds.set(new Set());
  }

  protected selectAll(): void {
    this.selectedIds.set(new Set(this.visibleRows().map((row) => row.id)));
  }

  protected select({ row, isSelected }: RowSelection): void {
    this.selectedIds.update((ids) => {
      const next = new Set(ids);
      if (isSelected) {
        next.add(row.id);
      } else {
        next.delete(row.id);
      }
      return next;
    });
  }

  protected search(event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      this.query.set(event.target.value);
    }
  }
}

function countMinis(rows: readonly MiniRow[]): number {
  return rows.reduce((sum, row) => sum + row.count, 0);
}

/** The values of one facet of the rows, sorted, with "none" last under the given label. */
function optionsOf(
  rows: readonly MiniRow[],
  valuesOf: (row: MiniRow) => readonly string[],
  noneLabel = '',
): FilterOption[] {
  const values = [...new Set(rows.flatMap(valuesOf))].sort((a, b) =>
    a === NONE ? 1 : b === NONE ? -1 : a.localeCompare(b),
  );
  return values.map((value) => ({
    value,
    label: value === NONE ? noneLabel : value,
    count: countMinis(rows.filter((row) => valuesOf(row).includes(value))),
  }));
}
