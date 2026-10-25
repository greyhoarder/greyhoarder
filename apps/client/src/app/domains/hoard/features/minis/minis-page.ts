import { Component, computed, inject } from '@angular/core';
import { hobbyStatuses } from '@greyhoarder/domain/hoard';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideSearch, lucideX } from '@ng-icons/lucide';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmInputGroupImports } from '@spartan-ng/helm/input-group';
import { HlmSkeleton } from '@spartan-ng/helm/skeleton';
import { HoardView } from '../../data/hoard-view';
import { MinisList } from '../../data/minis-list';
import { FilterChip, type FilterOption } from '../../ui/filter-chip/filter-chip';
import { MiniCard } from './mini-card/mini-card';
import { MiniTable, type RowSelection } from './mini-table/mini-table';
import { NONE } from '../../data/mini-filter';
import { countMinis, type MiniRow } from '../../data/mini-row';
import { STATUS_LABELS } from '../../util/status-labels';

/** The Minis tab of the hoard: search, filters, selection and the minis as cards or table. */
@Component({
  selector: 'app-minis-page',
  imports: [NgIcon, HlmButton, HlmInputGroupImports, HlmSkeleton, FilterChip, MiniCard, MiniTable],
  providers: [provideIcons({ lucideSearch, lucideX })],
  templateUrl: './minis-page.html',
  host: { class: 'flex flex-col gap-3' },
})
export class MinisPage {
  protected readonly store = inject(MinisList);
  protected readonly view = inject(HoardView);

  protected readonly factionOptions = computed(() =>
    optionsOf(this.store.rows(), (row) => row.factions),
  );
  protected readonly statusOptions = computed<FilterOption[]>(() =>
    hobbyStatuses.map((status) => ({
      value: status,
      label: STATUS_LABELS[status],
      count: countMinis(this.store.rows().filter((row) => row.status === status)),
    })),
  );
  protected readonly boxOptions = computed(() =>
    optionsOf(this.store.rows(), (row) => [row.box ?? NONE], 'Without box'),
  );

  protected select({ row, isSelected }: RowSelection): void {
    this.store.select(row.id, isSelected);
  }

  protected search(event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      this.store.query.set(event.target.value);
    }
  }
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
