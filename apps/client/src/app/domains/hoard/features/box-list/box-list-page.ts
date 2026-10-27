import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { boxProgresses } from '../../models/box-progress';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideSearch, lucideX } from '@ng-icons/lucide';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmInputGroupImports } from '@spartan-ng/helm/input-group';
import { HlmSkeleton } from '@spartan-ng/helm/skeleton';
import { BoxesList } from '../../application/boxes/boxes-list';
import { HoardView } from '../../application/hoard-view';
import { BoxCard } from './box-card/box-card';
import { type BoxSelection, BoxTable } from './box-table/box-table';
import { FilterChip, type FilterOption } from '../../ui/filter-chip/filter-chip';
import { LongPress } from '../../ui/long-press/long-press';
import { PROGRESS_LABELS } from '../../util/box-labels';
import { progressOf, sprueCount } from '../../application/boxes/box-row';
import type { BoxRow } from '../../application/boxes/box-row';

/** The Boxes tab of the hoard: search, filters, selection and the boxes as cards or table. */
@Component({
  selector: 'app-box-list-page',
  imports: [
    NgIcon,
    HlmButton,
    HlmInputGroupImports,
    HlmSkeleton,
    BoxCard,
    BoxTable,
    FilterChip,
    LongPress,
  ],
  providers: [provideIcons({ lucideSearch, lucideX })],
  templateUrl: './box-list-page.html',
  host: { class: '@container flex flex-col gap-3' },
})
export class BoxListPage {
  protected readonly store = inject(BoxesList);
  protected readonly view = inject(HoardView);
  private readonly router = inject(Router);

  protected readonly factionOptions = computed(() =>
    optionsOf(this.store.boxes(), (box) => box.factions),
  );
  protected readonly progressOptions = computed<FilterOption[]>(() =>
    boxProgresses.map((progress) => ({
      value: progress,
      label: PROGRESS_LABELS[progress],
      count: this.store.boxes().filter((box) => progressOf(box) === progress).length,
    })),
  );
  protected readonly tagOptions = computed(() => optionsOf(this.store.boxes(), (box) => box.tags));

  /** E.g. "6 boxes · 26 minis still on the sprue". */
  protected readonly summary = computed(() => {
    const boxes = this.store.visibleBoxes();
    const sprue = boxes.reduce((sum, box) => sum + sprueCount(box), 0);
    return `${boxes.length} ${boxes.length === 1 ? 'box' : 'boxes'} · ${sprue} minis still on the sprue`;
  });

  protected select({ box, isSelected }: BoxSelection): void {
    this.store.select(box.id, isSelected);
  }

  protected open(box: BoxRow): void {
    void this.router.navigate(['/hoard/boxes', box.id]);
  }

  protected search(event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      this.store.query.set(event.target.value);
    }
  }
}

/** The values of the boxes, sorted, each with how many boxes have it. */
function optionsOf(
  boxes: readonly BoxRow[],
  valuesOf: (box: BoxRow) => readonly string[],
): FilterOption[] {
  const values = [...new Set(boxes.flatMap(valuesOf))].sort((a, b) => a.localeCompare(b));
  return values.map((value) => ({
    value,
    label: value,
    count: boxes.filter((box) => valuesOf(box).includes(value)).length,
  }));
}
