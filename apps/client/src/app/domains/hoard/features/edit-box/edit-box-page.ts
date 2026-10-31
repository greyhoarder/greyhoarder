import {
  afterRenderEffect,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  linkedSignal,
  signal,
  viewChild,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { editedRows, sprueMinis, sprueRowCounts } from '@greyhoarder/domain/hoard';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronLeft } from '@ng-icons/lucide';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmSkeleton } from '@spartan-ng/helm/skeleton';
import { HoardChanges } from '../../application/hoard-changes';
import { loadedKit } from '../../application/loaded-kit';
import { BoxesStore } from '../../data/boxes-store';
import { MinisStore } from '../../data/minis-store';
import { HttpBoxesAdapter } from '../../infrastructure/http-boxes-adapter';
import { SprueRow } from '../../ui/sprue-row/sprue-row';
import { eitherOrText } from '../../util/either-or';

/**
 * Counts the minis on the sprue of a box from a kit anew, row by row of its kit; nothing is saved
 * before "Save". Specified in docs/screens/edit-box.md.
 */
@Component({
  selector: 'app-edit-box-page',
  imports: [RouterLink, NgIcon, HlmButton, HlmSkeleton, SprueRow],
  providers: [provideIcons({ lucideChevronLeft })],
  templateUrl: './edit-box-page.html',
  host: { class: 'flex w-full flex-col gap-6 p-4 sm:p-8 lg:p-10' },
})
export class EditBoxPage {
  /** From the route. */
  readonly id = input.required<string>();

  private readonly boxes = inject(BoxesStore);
  private readonly minis = inject(MinisStore);
  private readonly adapter = inject(HttpBoxesAdapter);
  private readonly hoardChanges = inject(HoardChanges);
  private readonly router = inject(Router);
  private readonly titleElement = viewChild<ElementRef<HTMLElement>>('heading');

  protected readonly box = computed(() => this.boxes.boxes().find((box) => box.id === this.id()));
  private readonly boxMinis = computed(() => this.minis.minis().filter((mini) => mini.boxId === this.id()));

  /** The kit in the version the box records; none for boxes without a kit. */
  private readonly loadedKit = loadedKit(() => this.box()?.kit);
  protected readonly kit = this.loadedKit.kit;

  protected readonly isLoading = computed(
    () => this.boxes.isLoading() || this.minis.isLoading() || this.loadedKit.isLoading(),
  );
  protected readonly hasFailed = computed(
    () => this.boxes.hasFailed() || this.minis.hasFailed() || this.loadedKit.hasFailed() || this.loadedKit.isMissing(),
  );

  protected readonly title = computed(() => `Edit ${eitherOrText(this.box()?.name ?? '')}`);
  protected readonly sprueRows = computed(() => {
    const kit = this.kit();
    return kit ? sprueMinis(kit) : [];
  });
  /** What the box has on the sprue per row, where the counting starts. */
  private readonly startRows = computed(() => {
    const kit = this.kit();
    return kit ? sprueRowCounts(kit, this.boxMinis()) : [];
  });
  /** Counted by the user; kept when saving fails. */
  protected readonly rows = linkedSignal(() => this.startRows());
  /** What saving the counted rows would do; the ids of the minis it would add are never used. */
  private readonly edit = computed(() => {
    const [kit, box] = [this.kit(), this.box()];
    return kit && box ? editedRows(kit, box, this.boxMinis(), this.rows(), () => '') : undefined;
  });
  protected readonly deleteCount = computed(() => this.edit()?.deletedIds.length ?? 0);
  private readonly isChanged = computed(() => (this.edit()?.added.length ?? 0) > 0 || this.deleteCount() > 0);

  protected readonly isSaving = signal(false);
  protected readonly hasSaveFailed = signal(false);

  constructor() {
    afterRenderEffect(() => this.titleElement()?.nativeElement.focus());
  }

  protected changeRow(row: number, by: 1 | -1): void {
    this.rows.update((rows) => rows.map((count, index) => (index === row ? Math.max(0, count + by) : count)));
  }

  /** Saves changed rows and leads back to the box; it asks there once no minis are left. */
  protected async save(): Promise<void> {
    if (!this.isChanged()) {
      this.toBox();
      return;
    }
    this.isSaving.set(true);
    this.hasSaveFailed.set(false);
    try {
      const { box, addedMinis, deletedMiniIds, minis } = await this.adapter.editRows(this.id(), this.rows());
      this.boxes.apply([box]);
      this.minis.add(addedMinis);
      this.hoardChanges.removed(deletedMiniIds, minis);
      this.toBox(this.boxMinis().length === 0);
    } catch {
      this.hasSaveFailed.set(true);
    } finally {
      this.isSaving.set(false);
    }
  }

  /** Leaves without saving. */
  protected cancel(): void {
    void this.router.navigate(['/hoard/boxes', this.id()]);
  }

  private toBox(isEmptied = false): void {
    void this.router.navigate(['/hoard/boxes', this.id()], { replaceUrl: true, state: { isEmptied } });
  }
}
