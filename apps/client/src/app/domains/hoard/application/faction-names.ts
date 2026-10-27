import { computed, inject, Injectable } from '@angular/core';
import { BoxesStore } from '../data/boxes-store';
import { MinisStore } from '../data/minis-store';

/** The names of the factions boxes and minis refer to, by id, as the server delivers them with the hoard. */
@Injectable({ providedIn: 'root' })
export class FactionNames {
  private readonly boxesStore = inject(BoxesStore);
  private readonly minisStore = inject(MinisStore);

  readonly names = computed<ReadonlyMap<string, string>>(
    () => new Map([...this.boxesStore.factionNames(), ...this.minisStore.factionNames()]),
  );
  /** The names of the factions' game systems, by faction id. */
  readonly systemNames = this.minisStore.systemNames;
}
