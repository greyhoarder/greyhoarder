import { computed, inject, Injectable, resource } from '@angular/core';
import type { Box } from '@greyhoarder/domain/hoard';
import { HttpBoxesAdapter } from '../infrastructure/http-boxes-adapter';
import { FactionNamesStore } from './faction-names-store';

/** The boxes of the hoard as the server has them, shared by adding boxes and the lists of the hoard. */
@Injectable({ providedIn: 'root' })
export class BoxesStore {
  private readonly adapter = inject(HttpBoxesAdapter);
  private readonly factionNames = inject(FactionNamesStore);

  private readonly loaded = resource({
    loader: async () => {
      const { boxes, factionNames } = await this.adapter.list();
      this.factionNames.add(factionNames);
      return boxes;
    },
  });

  /** Empty until loaded; keeps the previous boxes while reloading. */
  readonly boxes = computed<readonly Box[]>(() => (this.loaded.hasValue() ? this.loaded.value() : []));
  /** Only the first load; a reload keeps showing what was there. */
  readonly isLoading = computed(() => this.loaded.status() === 'loading');
  readonly hasFailed = computed(() => this.loaded.error() !== undefined);

  /** Fetches the boxes again, e.g. after boxes were added on the server. */
  reload(): void {
    this.loaded.reload();
  }
}
