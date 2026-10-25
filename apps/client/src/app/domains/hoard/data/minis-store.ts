import { computed, inject, Injectable, resource } from '@angular/core';
import type { Mini } from '@greyhoarder/domain/hoard';
import { HttpMinisAdapter } from '../infrastructure/http-minis-adapter';
import { FactionNamesStore } from './faction-names-store';

/** The minis of the hoard as the server has them, shared by adding boxes and the lists of the hoard. */
@Injectable({ providedIn: 'root' })
export class MinisStore {
  private readonly adapter = inject(HttpMinisAdapter);
  private readonly factionNames = inject(FactionNamesStore);

  private readonly loaded = resource({
    loader: async () => {
      const { minis, factionNames } = await this.adapter.list();
      this.factionNames.add(factionNames);
      return minis;
    },
  });

  /** Empty until loaded; keeps the previous minis while reloading. */
  readonly minis = computed<readonly Mini[]>(() => (this.loaded.hasValue() ? this.loaded.value() : []));
  /** Only the first load; a reload keeps showing what was there. */
  readonly isLoading = computed(() => this.loaded.status() === 'loading');
  readonly hasFailed = computed(() => this.loaded.error() !== undefined);

  /** Fetches the minis again, e.g. after boxes were added on the server. */
  reload(): void {
    this.loaded.reload();
  }
}
