import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpBoxesAdapter } from '../../infrastructure/http-boxes-adapter';
import { eitherOrText } from '../../util/either-or';
import { BoxesStore } from '../../data/boxes-store';
import { MinisStore } from '../../data/minis-store';
import { HoardChanges } from '../hoard-changes';

/**
 * Deleting boxes for good after asking, with all their minis: boxes left empty by deleting minis,
 * or a box from its menu (docs/domains/hoard.md, Boxes and kits). Provided by each screen that
 * asks.
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
    readonly miniCount: number;
  }>({ names: [], miniCount: 0 });
  readonly isAsking = signal(false);
  readonly isDeleting = signal(false);
  readonly hasFailed = signal(false);

  /** The boxes' names as plain text, in the order asked. */
  readonly names = computed(() => this.asked().names);
  /** How many minis go with the boxes, gone ones included. */
  readonly miniCount = computed(() => this.asked().miniCount);

  ask(ids: readonly string[]): void {
    const asked = new Set(ids);
    const boxes = this.boxesStore.boxes().filter((box) => asked.has(box.id));
    this.ids.set(boxes.map((box) => box.id));
    this.asked.set({
      names: boxes.map((box) => eitherOrText(box.name)),
      miniCount: this.minisStore
        .minis()
        .filter((mini) => mini.boxId !== undefined && asked.has(mini.boxId)).length,
    });
    this.hasFailed.set(false);
    this.isAsking.set(true);
  }

  /** Keeps the boxes. */
  cancel(): void {
    this.isAsking.set(false);
  }

  /**
   * Deletes the boxes asked about with all their minis, one box after the other; a box that fails
   * stays asked about with those after it.
   *
   * @returns whether every box is deleted
   */
  async confirm(): Promise<boolean> {
    this.isDeleting.set(true);
    this.hasFailed.set(false);
    try {
      for (const id of this.ids()) {
        const { deletedMiniIds, minis } = await this.adapter.delete(id);
        this.hoardChanges.removed(deletedMiniIds, minis);
        this.boxesStore.remove([id]);
        this.ids.update((ids) => ids.filter((asked) => asked !== id));
      }
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
