import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpBoxesAdapter } from '../../infrastructure/http-boxes-adapter';
import { eitherOrText } from '../../util/either-or';
import { BoxesStore } from '../../data/boxes-store';
import { MinisStore } from '../../data/minis-store';
import { HoardChanges } from '../hoard-changes';

/**
 * Deleting boxes for good after asking, with all their minis or keeping those past the sprue
 * without a box: boxes left empty by deleting minis, or a box from its menu (docs/domains/hoard.md,
 * Boxes and kits). Provided by each screen that asks.
 */
@Injectable()
export class BoxesDeletion {
  private readonly minisStore = inject(MinisStore);
  private readonly hoardChanges = inject(HoardChanges);
  private readonly boxesStore = inject(BoxesStore);
  private readonly adapter = inject(HttpBoxesAdapter);

  /** The boxes asked about and not deleted yet. */
  private readonly ids = signal<readonly string[]>([]);
  /** What the dialog says about the boxes, kept while it closes so its text stays as it was. */
  private readonly asked = signal<{
    readonly names: readonly string[];
    readonly builtMiniCount: number;
    readonly sprueMiniCount: number;
  }>({ names: [], builtMiniCount: 0, sprueMiniCount: 0 });
  readonly isAsking = signal(false);
  readonly isDeleting = signal(false);
  readonly hasFailed = signal(false);

  /** The boxes' names as plain text, in the order asked. */
  readonly names = computed(() => this.asked().names);
  /** How many minis of the boxes are past the sprue, gone ones included: those that can stay. */
  readonly builtMiniCount = computed(() => this.asked().builtMiniCount);
  /** How many minis of the boxes are on the sprue, gone ones included: those that always go with them. */
  readonly sprueMiniCount = computed(() => this.asked().sprueMiniCount);

  ask(ids: readonly string[]): void {
    const asked = new Set(ids);
    const boxes = this.boxesStore.boxes().filter((box) => asked.has(box.id));
    const minis = this.minisStore.minis().filter((mini) => mini.boxId !== undefined && asked.has(mini.boxId));
    this.ids.set(boxes.map((box) => box.id));
    this.asked.set({
      names: boxes.map((box) => eitherOrText(box.name)),
      builtMiniCount: minis.filter((mini) => mini.status !== 'sprue').length,
      sprueMiniCount: minis.filter((mini) => mini.status === 'sprue').length,
    });
    this.hasFailed.set(false);
    this.isAsking.set(true);
  }

  /** Keeps the boxes. */
  cancel(): void {
    this.isAsking.set(false);
  }

  /**
   * Deletes the boxes asked about with all their minis, together or none of them.
   *
   * @returns whether every box is deleted
   */
  confirm(): Promise<boolean> {
    return this.deleteAsked((ids) => this.adapter.delete(ids));
  }

  /**
   * Deletes the boxes asked about with their minis on the sprue, keeping the others in the hoard
   * without a box, as `confirm` does.
   *
   * @returns whether every box is deleted
   */
  confirmKeepingBuiltMinis(): Promise<boolean> {
    return this.deleteAsked((ids) => this.adapter.delete(ids, { keepBuiltMinis: true }));
  }

  private async deleteAsked(
    remove: (ids: readonly string[]) => ReturnType<HttpBoxesAdapter['delete']>,
  ): Promise<boolean> {
    this.isDeleting.set(true);
    this.hasFailed.set(false);
    try {
      const { deletedMiniIds, minis } = await remove(this.ids());
      this.hoardChanges.removed(deletedMiniIds, minis);
      this.boxesStore.remove(this.ids());
      this.ids.set([]);
      this.isAsking.set(false);
      return true;
    } catch {
      this.hasFailed.set(true);
      return false;
    } finally {
      this.isDeleting.set(false);
    }
  }
}
