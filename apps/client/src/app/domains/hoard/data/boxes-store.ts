import { computed, inject, Injectable, resource } from '@angular/core';
import type { Box } from '@greyhoarder/domain/hoard';
import { HttpBoxesAdapter } from '../infrastructure/http-boxes-adapter';

/** The boxes of the hoard as the server has them, shared by adding boxes and the lists of the hoard. */
@Injectable({ providedIn: 'root' })
export class BoxesStore {
  private readonly adapter = inject(HttpBoxesAdapter);

  private readonly loaded = resource({ loader: () => this.adapter.list() });

  /** Empty until loaded; keeps the previous boxes while reloading. */
  readonly boxes = computed<readonly Box[]>(() => (this.loaded.hasValue() ? this.loaded.value().boxes : []));
  /** The names of the factions the boxes refer to, by id, as the server delivers them with the boxes. */
  readonly factionNames = computed<ReadonlyMap<string, string>>(() =>
    this.loaded.hasValue() ? this.loaded.value().factionNames : new Map(),
  );
  /** Only the first load; a reload keeps showing what was there. */
  readonly isLoading = computed(() => this.loaded.status() === 'loading');
  readonly hasFailed = computed(() => this.loaded.error() !== undefined);

  /** Takes boxes the server deleted out of the hoard. */
  remove(ids: readonly string[]): void {
    const deleted = new Set(ids);
    this.loaded.update((loaded) => loaded && { ...loaded, boxes: loaded.boxes.filter((box) => !deleted.has(box.id)) });
  }

  /** Fetches the boxes again, e.g. after boxes were added on the server. */
  reload(): void {
    this.loaded.reload();
  }
}
