import { Component, computed, input, output, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowDown,
  lucideArrowUp,
  lucideChevronsUpDown,
  lucideEllipsisVertical,
} from '@ng-icons/lucide';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmTableImports } from '@spartan-ng/helm/table';
import type { MiniRow } from '../../../data/mini-row';
import { type MiniSortOrder, sortRows } from '../../../data/mini-sort';
import type { SortDirection } from '../../../util/sort-direction';
import { RowCheck } from '../../../ui/row-check/row-check';
import { StatusBadge } from '../../../ui/status-badge/status-badge';
import { EitherOrName } from '../../../ui/either-or-name/either-or-name';

interface Column {
  readonly order: MiniSortOrder;
  readonly label: string;
  readonly isNumeric?: boolean;
}

const COLUMNS: readonly Column[] = [
  { order: 'name', label: 'Name' },
  { order: 'army', label: 'Faction' },
  { order: 'box', label: 'Box' },
  { order: 'status', label: 'Status' },
  { order: 'count', label: 'Count', isNumeric: true },
];

export interface RowSelection {
  readonly row: MiniRow;
  readonly isSelected: boolean;
}

/** The minis as a table, sorted by clicking a column header; starts sorted by faction. */
@Component({
  selector: 'app-mini-table',
  imports: [EitherOrName, NgIcon, HlmBadge, HlmButton, HlmTableImports, RowCheck, StatusBadge],
  providers: [
    provideIcons({ lucideArrowDown, lucideArrowUp, lucideChevronsUpDown, lucideEllipsisVertical }),
  ],
  templateUrl: './mini-table.html',
  host: { class: 'block rounded-xl border bg-card' },
})
export class MiniTable {
  readonly rows = input.required<readonly MiniRow[]>();
  /** In selection mode every check shows, and clicking a row selects it. */
  readonly isSelectionMode = input(false);
  readonly selectedIds = input<ReadonlySet<string>>(new Set());

  readonly selectedChange = output<RowSelection>();
  /** Outside selection mode a click on a line opens its row. */
  readonly opened = output<MiniRow>();

  protected readonly columns = COLUMNS;
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
