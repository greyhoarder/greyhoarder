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
  /** The name of the faction each faction is part of, by faction name, as the lists of the hoard filter by names. */
  readonly partOfByName = computed<ReadonlyMap<string, string>>(() => {
    const names = this.names();
    return new Map(
      [...this.minisStore.partOf()].flatMap(([id, partOfId]) => {
        const name = names.get(id);
        const partOfName = names.get(partOfId);
        return name === undefined || partOfName === undefined ? [] : [[name, partOfName] as const];
      }),
    );
  });
}
