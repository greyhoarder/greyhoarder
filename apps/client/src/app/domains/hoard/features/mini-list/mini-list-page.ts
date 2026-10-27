import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { hobbyStatuses } from '@greyhoarder/domain/hoard';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideSearch, lucideX } from '@ng-icons/lucide';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmInputGroupImports } from '@spartan-ng/helm/input-group';
import { HlmSkeleton } from '@spartan-ng/helm/skeleton';
import { BoxesStore } from '../../data/boxes-store';
import { HoardView } from '../../application/hoard-view';
import { BoxesDeletion } from '../../application/boxes-deletion';
import { MinisDeletion } from '../../application/minis-deletion';
import { MinisList } from '../../application/minis-list';
import { DeleteMinisDialog } from '../../ui/delete-minis-dialog/delete-minis-dialog';
import { EmptyBoxesDialog } from '../../ui/empty-boxes-dialog/empty-boxes-dialog';
import { FilterChip, type FilterOption } from '../../ui/filter-chip/filter-chip';
import { SelectionBar } from '../../ui/selection-bar/selection-bar';
import { MiniGroupCard } from './mini-group-card/mini-group-card';
import { MiniTable, type RowSelection } from './mini-table/mini-table';
import { GONE, NONE } from '../../application/mini-filter';
import { countMinis, type MiniRow } from '../../application/mini-row';
import { distinctBoxNames } from '../../util/box-labels';
import { STATUS_LABELS } from '../../util/status-labels';

/** The Minis tab of the hoard: search, filters, selection and the minis as group cards or table. */
@Component({
  selector: 'app-mini-list-page',
  imports: [
    NgIcon,
    HlmButton,
    HlmInputGroupImports,
    HlmSkeleton,
    FilterChip,
    MiniGroupCard,
    MiniTable,
    SelectionBar,
    DeleteMinisDialog,
    EmptyBoxesDialog,
  ],
  providers: [provideIcons({ lucideSearch, lucideX }), MinisDeletion, BoxesDeletion],
  templateUrl: './mini-list-page.html',
  host: { class: 'flex flex-col gap-3' },
})
export class MiniListPage {
  protected readonly store = inject(MinisList);
  protected readonly view = inject(HoardView);
  private readonly boxes = inject(BoxesStore);
  private readonly router = inject(Router);
  protected readonly deletion = inject(MinisDeletion);
  protected readonly boxesDeletion = inject(BoxesDeletion);

  protected readonly factionOptions = computed(() =>
    optionsOf(this.store.presentRows(), (row) => row.factions),
  );
  /** The statuses past the sprue of the minis that are not gone, then the gone ones. */
  protected readonly statusOptions = computed<FilterOption[]>(() => [
    ...hobbyStatuses
      .filter((status) => status !== 'sprue')
      .map((status) => ({
        value: status,
        label: STATUS_LABELS[status],
        count: countMinis(this.store.presentRows().filter((row) => row.status === status)),
      })),
    {
      value: GONE,
      label: 'Gone',
      count: countMinis(this.store.rows().filter((row) => row.departure)),
    },
  ]);
  /** By box, so boxes with the same name stay apart. */
  protected readonly boxOptions = computed(() => {
    const names = distinctBoxNames(this.boxes.boxes());
    return optionsOf(
      this.store.presentRows(),
      (row) => [row.boxId ?? NONE],
      'Without box',
      (id) => names.get(id) ?? id,
    );
  });

  /** Gone minis can't leave again; the others among the selected can. */
  protected readonly canLeave = computed(() =>
    this.store.rows().some((row) => this.store.selectedIds().has(row.id) && !row.departure),
  );

  protected async deleteSelected(): Promise<void> {
    const { isDeleted, emptiedBoxIds } = await this.deletion.confirm();
    if (isDeleted) {
      this.store.finishSelecting();
    }
    if (emptiedBoxIds.length > 0) {
      this.boxesDeletion.ask(emptiedBoxIds);
    }
  }

  protected async deleteEmptyBoxes(): Promise<void> {
    await this.boxesDeletion.confirm();
  }

  protected select({ row, isSelected }: RowSelection): void {
    this.store.select(row.id, isSelected);
  }

  protected open(row: MiniRow): void {
    void this.router.navigate(['/hoard/minis', row.id]);
  }

  protected search(event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      this.store.query.set(event.target.value);
    }
  }
}

/** The values of one facet of the rows, sorted by their labels, with "none" last under the given label. */
function optionsOf(
  rows: readonly MiniRow[],
  valuesOf: (row: MiniRow) => readonly string[],
  noneLabel = '',
  labelOf: (value: string) => string = (value) => value,
): FilterOption[] {
  return [...new Set(rows.flatMap(valuesOf))]
    .map((value) => ({
      value,
      label: value === NONE ? noneLabel : labelOf(value),
      count: countMinis(rows.filter((row) => valuesOf(row).includes(value))),
    }))
    .sort((a, b) =>
      a.value === NONE ? 1 : b.value === NONE ? -1 : a.label.localeCompare(b.label),
    );
}
