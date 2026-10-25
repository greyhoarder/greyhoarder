import { computed, inject, Injectable } from '@angular/core';
import { hasReached } from '@greyhoarder/domain/hoard';
import { type FactionProgress, factionProgresses } from '../models/faction-progress';
import { FactionNamesStore } from './faction-names-store';
import { MinisStore } from './minis-store';

/** One faction of the hoard with its names, for the overview on the dashboard. */
export interface FactionOverview extends Omit<FactionProgress, 'factionId'> {
  /** The faction's name; left out for the minis without a faction. */
  readonly name?: string;
  /** The name of its game system; left out without a faction and for whole game systems. */
  readonly systemName?: string;
}

/** The hoard counted by faction (docs/screens/dashboard.md, "In the hoard"). */
@Injectable({ providedIn: 'root' })
export class HoardByFaction {
  private readonly minisStore = inject(MinisStore);
  private readonly factionNames = inject(FactionNamesStore);

  readonly isLoading = this.minisStore.isLoading;
  readonly hasFailed = this.minisStore.hasFailed;
  readonly miniCount = computed(() => this.minisStore.minis().length);
  readonly paintedCount = computed(
    () => this.minisStore.minis().filter((mini) => hasReached(mini.status, 'painted')).length,
  );

  /** Most minis first, then by name; the minis without a faction last. */
  readonly factions = computed<readonly FactionOverview[]>(() => {
    const names = this.factionNames.names();
    const systemNames = this.factionNames.systemNames();
    return factionProgresses(this.minisStore.minis())
      .map(({ factionId, ...progress }) => ({
        ...progress,
        ...(factionId === undefined ? {} : { name: names.get(factionId) ?? factionId, systemName: systemNames.get(factionId) }),
      }))
      .sort(
        (a, b) =>
          Number(a.name === undefined) - Number(b.name === undefined) ||
          b.miniCount - a.miniCount ||
          (a.name ?? '').localeCompare(b.name ?? ''),
      );
  });
}
