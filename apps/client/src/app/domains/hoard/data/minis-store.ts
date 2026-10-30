import { computed, inject, Injectable, resource } from '@angular/core';
import type { Mini } from '@greyhoarder/domain/hoard';
import { HttpMinisAdapter } from '../infrastructure/http-minis-adapter';

/** The minis of the hoard as the server has them, shared by adding boxes and the lists of the hoard. */
@Injectable({ providedIn: 'root' })
export class MinisStore {
  private readonly adapter = inject(HttpMinisAdapter);

  private readonly loaded = resource({ loader: () => this.adapter.list() });

  /** Empty until loaded; keeps the previous minis while reloading. */
  readonly minis = computed<readonly Mini[]>(() =>
    this.loaded.hasValue() ? this.loaded.value().minis : [],
  );
  /** The names of the factions the minis refer to, by id, as the server delivers them with the minis. */
  readonly factionNames = computed<ReadonlyMap<string, string>>(() =>
    this.loaded.hasValue() ? this.loaded.value().factionNames : new Map(),
  );
  /** The names of the factions' game systems, by faction id. */
  readonly systemNames = computed<ReadonlyMap<string, string>>(() =>
    this.loaded.hasValue() ? this.loaded.value().systemNames : new Map(),
  );
  /** Only the first load; a reload keeps showing what was there. */
  readonly isLoading = computed(() => this.loaded.status() === 'loading');
  readonly hasFailed = computed(() => this.loaded.error() !== undefined);

  /**
   * Puts minis the server changed in place of their old versions, without loading every mini again,
   * and learns the names of own factions they carry, e.g. one the change added.
   */
  apply(changed: readonly Mini[], ownFactionNames: ReadonlyMap<string, string> = new Map()): void {
    const byId = new Map(changed.map((mini) => [mini.id, mini]));
    this.loaded.update(
      (loaded) =>
        loaded && {
          ...loaded,
          minis: loaded.minis.map((mini) => byId.get(mini.id) ?? mini),
          factionNames: new Map([...loaded.factionNames, ...ownFactionNames]),
        },
    );
  }

  /** Takes minis the server deleted out of the hoard. */
  remove(ids: readonly string[]): void {
    const deleted = new Set(ids);
    this.loaded.update(
      (loaded) =>
        loaded && { ...loaded, minis: loaded.minis.filter((mini) => !deleted.has(mini.id)) },
    );
  }

  /** Fetches the minis again, e.g. after boxes were added on the server. */
  reload(): void {
    this.loaded.reload();
  }
}
