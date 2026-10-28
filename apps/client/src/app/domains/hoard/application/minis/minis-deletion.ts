import { computed, inject, Injectable, signal } from '@angular/core';
import type { Mini } from '@greyhoarder/domain/hoard';
import { HttpMinisAdapter } from '../../infrastructure/http-minis-adapter';
import { eitherOrText } from '../../util/either-or';
import { MinisStore } from '../../data/minis-store';
import { HoardChanges } from '../hoard-changes';

/**
 * Deleting selected minis for good after asking: what the delete dialog says about them, and the
 * deleting itself (docs/screens/hoard.md, Behavior). Provided by each screen that selects minis.
 */
@Injectable()
export class MinisDeletion {
  private readonly minisStore = inject(MinisStore);
  private readonly hoardChanges = inject(HoardChanges);
  private readonly adapter = inject(HttpMinisAdapter);

  /**
   * The minis asked about, with what the dialog says about them; kept while it closes, so its
   * text stays as it was.
   */
  private readonly asked = signal<{
    readonly ids: readonly string[];
    readonly count: number;
    readonly names: string;
  }>({ ids: [], count: 0, names: '' });
  readonly isAsking = signal(false);
  readonly isDeleting = signal(false);
  readonly hasFailed = signal(false);

  readonly count = computed(() => this.asked().count);
  /** Each name once with how many have it, in the order they come, e.g. "Boy ×2, Nob". */
  readonly names = computed(() => this.asked().names);

  ask(ids: ReadonlySet<string>): void {
    const minis = this.minisStore.minis().filter((mini) => ids.has(mini.id));
    this.asked.set({
      ids: minis.map((mini) => mini.id),
      count: minis.length,
      names: namesOf(minis),
    });
    this.hasFailed.set(false);
    this.isAsking.set(true);
  }

  cancel(): void {
    this.isAsking.set(false);
  }

  /**
   * Deletes the minis asked about; their boxes stay, also empty ones.
   *
   * @returns whether they are deleted, and the ids of the boxes left without any minis
   */
  async confirm(): Promise<{
    readonly isDeleted: boolean;
    readonly emptiedBoxIds: readonly string[];
  }> {
    const { ids } = this.asked();
    this.isDeleting.set(true);
    this.hasFailed.set(false);
    try {
      const { emptiedBoxIds, minis } = await this.adapter.delete(ids);
      this.hoardChanges.removed(ids, minis);
      this.isAsking.set(false);
      return { isDeleted: true, emptiedBoxIds };
    } catch {
      this.hasFailed.set(true);
      return { isDeleted: false, emptiedBoxIds: [] };
    } finally {
      this.isDeleting.set(false);
    }
  }
}

function namesOf(minis: readonly Mini[]): string {
  const counts = new Map<string, number>();
  for (const { name } of minis) {
    const text = eitherOrText(name);
    counts.set(text, (counts.get(text) ?? 0) + 1);
  }
  return [...counts].map(([name, count]) => (count > 1 ? `${name} ×${count}` : name)).join(', ');
}
