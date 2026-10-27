import { Component, computed, input, output, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowDown,
  lucideArrowUp,
  lucideChevronsUpDown,
  lucideEllipsisVertical,
} from '@ng-icons/lucide';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { kitLine } from '../../../util/box-labels';
import { miniCount, paintedCount, percentOf, progressOf, sprueCount } from '../../../application/box-row';
import { hasPercent } from '../../../models/box-progress';
import { ProgressBadge } from '../../../ui/progress-badge/progress-badge';
import { formatDate } from '../../../util/format-date';
import type { BoxRow } from '../../../application/box-row';
import { type BoxSortOrder, sortBoxes } from '../../../application/box-sort';
import type { SortDirection } from '../../../util/sort-direction';
import { ProgressBar } from '../../../ui/progress-bar/progress-bar';
import { RowCheck } from '../../../ui/row-check/row-check';
import { EitherOrName } from '../../../ui/either-or-name/either-or-name';

export interface BoxSelection {
  readonly box: BoxRow;
  readonly isSelected: boolean;
}

interface Column {
  readonly order: BoxSortOrder;
  readonly label: string;
  readonly isNumeric?: boolean;
}

const COLUMNS: readonly Column[] = [
  { order: 'name', label: 'Box' },
  { order: 'faction', label: 'Faction' },
  { order: 'progress', label: 'Progress' },
  { order: 'sprue', label: 'On the sprue', isNumeric: true },
  { order: 'painted', label: 'Painted', isNumeric: true },
  { order: 'added', label: 'Added' },
];

/** The boxes as a table, sorted by clicking a column header; starts with the newest. */
@Component({
  selector: 'app-box-table',
  imports: [EitherOrName, NgIcon, HlmButton, HlmTableImports, ProgressBadge, ProgressBar, RowCheck],
  providers: [
    provideIcons({ lucideArrowDown, lucideArrowUp, lucideChevronsUpDown, lucideEllipsisVertical }),
  ],
  templateUrl: './box-table.html',
  host: { class: 'block rounded-xl border bg-card' },
})
export class BoxTable {
  readonly boxes = input.required<readonly BoxRow[]>();
  /** In selection mode every check shows, and clicking a row selects it. */
  readonly isSelectionMode = input(false);
  readonly selectedIds = input<ReadonlySet<string>>(new Set());
  readonly selectedChange = output<BoxSelection>();
  /** Outside selection mode a click on a line opens its box. */
  readonly opened = output<BoxRow>();

  protected readonly columns = COLUMNS;
  protected readonly sortOrder = signal<BoxSortOrder>('added');
  protected readonly sortDirection = signal<SortDirection>('descending');
  protected readonly sortedBoxes = computed(() =>
    sortBoxes(this.boxes(), this.sortOrder(), this.sortDirection()),
  );

  protected readonly kitLine = kitLine;
  protected readonly sprueCount = sprueCount;
  protected readonly percentOf = percentOf;
  protected readonly progressOf = progressOf;
  protected readonly hasPercent = hasPercent;
  protected readonly formatDate = formatDate;

  protected paintedText(box: BoxRow): string {
    return `${paintedCount(box)} of ${miniCount(box)}`;
  }

  protected ariaSort(column: Column): SortDirection | 'none' {
    return column.order === this.sortOrder() ? this.sortDirection() : 'none';
  }

  /** A new column sorts ascending; the current one switches direction. */
  protected sortBy(order: BoxSortOrder): void {
    if (order === this.sortOrder()) {
      this.sortDirection.update((direction) =>
        direction === 'ascending' ? 'descending' : 'ascending',
      );
      return;
    }
    this.sortOrder.set(order);
    this.sortDirection.set('ascending');
  }

  protected select(box: BoxRow, isSelected: boolean): void {
    this.selectedChange.emit({ box, isSelected });
  }

  protected onRowClick(box: BoxRow): void {
    if (this.isSelectionMode()) {
      this.select(box, !this.selectedIds().has(box.id));
    } else {
      this.opened.emit(box);
    }
  }
}
