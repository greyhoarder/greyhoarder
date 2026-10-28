import { Component, computed, input, output, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideArrowDown, lucideArrowUp, lucideChevronsUpDown } from '@ng-icons/lucide';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { HlmTableImports } from '@spartan-ng/helm/table';
import type { MiniRow } from '../../../application/minis/mini-row';
import { type MiniSortOrder, sortRows } from '../../../application/minis/mini-sort';
import type { SortDirection } from '../../../util/sort-direction';
import { RowCheck } from '../../../ui/row-check/row-check';
import { GoneBadge } from '../../../ui/gone-badge/gone-badge';
import { StatusBadge } from '../../../ui/status-badge/status-badge';
import { EitherOrName } from '../../../ui/either-or-name/either-or-name';
import { boxLabel } from '../../../util/box-labels';
import { eitherOrText } from '../../../util/either-or';
import { LongPress } from '../../../ui/long-press/long-press';

interface Column {
  readonly order: MiniSortOrder;
  readonly label: string;
}

const COLUMNS: readonly Column[] = [
  { order: 'name', label: 'Name' },
  { order: 'army', label: 'Faction' },
  { order: 'box', label: 'Box' },
  { order: 'status', label: 'Status' },
];

export interface RowSelection {
  readonly row: MiniRow;
  readonly isSelected: boolean;
}

/** The minis as a table, one line each, sorted by clicking a column header; starts sorted by faction. */
@Component({
  selector: 'app-mini-table',
  imports: [
    EitherOrName,
    NgIcon,
    HlmBadge,
    HlmTableImports,
    LongPress,
    RowCheck,
    GoneBadge,
    StatusBadge,
  ],
  providers: [provideIcons({ lucideArrowDown, lucideArrowUp, lucideChevronsUpDown })],
  templateUrl: './mini-table.html',
  host: { class: 'block rounded-xl border bg-card' },
})
export class MiniTable {
  readonly rows = input.required<readonly MiniRow[]>();
  /** In selection mode every check shows, and clicking a row selects it. */
  readonly isSelectionMode = input(false);
  readonly selectedIds = input<ReadonlySet<string>>(new Set());

  readonly selectedChange = output<RowSelection>();
  /** The check in the header selects every line, or none once all are selected. */
  readonly allSelectedChange = output<boolean>();
  /** Outside selection mode a click on a line opens its mini. */
  readonly opened = output<MiniRow>();

  protected readonly columns = COLUMNS;
  protected readonly isAllSelected = computed(
    () => this.rows().length > 0 && this.rows().every((line) => this.selectedIds().has(line.id)),
  );
  protected readonly boxLabel = boxLabel;
  protected readonly eitherOrText = eitherOrText;
  protected readonly sortOrder = signal<MiniSortOrder>('army');
  protected readonly sortDirection = signal<SortDirection>('ascending');
  protected readonly sortedRows = computed(() =>
    sortRows(this.rows(), this.sortOrder(), this.sortDirection()),
  );

  /** A new column sorts ascending; the current one switches direction. */
  protected sortBy(order: MiniSortOrder): void {
    if (order === this.sortOrder()) {
      this.sortDirection.update((direction) =>
        direction === 'ascending' ? 'descending' : 'ascending',
      );
      return;
    }
    this.sortOrder.set(order);
    this.sortDirection.set('ascending');
  }

  protected ariaSort(column: Column): 'ascending' | 'descending' | 'none' {
    return column.order === this.sortOrder() ? this.sortDirection() : 'none';
  }

  protected select(row: MiniRow, isSelected: boolean): void {
    this.selectedChange.emit({ row, isSelected });
  }

  protected onRowClick(row: MiniRow): void {
    if (this.isSelectionMode()) {
      this.select(row, !this.selectedIds().has(row.id));
    } else {
      this.opened.emit(row);
    }
  }
}
