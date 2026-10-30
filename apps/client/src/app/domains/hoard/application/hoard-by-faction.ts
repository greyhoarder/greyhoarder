import { computed, inject, Injectable } from '@angular/core';
import { hasReached, isGone } from '@greyhoarder/domain/hoard';
import { type FactionProgress, factionProgresses } from '../models/faction-progress';
import { FactionNames } from './faction-names';
import { MinisStore } from '../data/minis-store';

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
  private readonly factionNames = inject(FactionNames);

  readonly isLoading = this.minisStore.isLoading;
  readonly hasFailed = this.minisStore.hasFailed;
  /** Gone minis are not counted. */
  private readonly minis = computed(() => this.minisStore.minis().filter((mini) => !isGone(mini)));
  readonly miniCount = computed(() => this.minis().length);
  readonly paintedCount = computed(() => this.minis().filter((mini) => hasReached(mini.status, 'painted')).length);

  /** Most minis first, then by name; the minis without a faction last. */
  readonly factions = computed<readonly FactionOverview[]>(() => {
    const names = this.factionNames.names();
    const systemNames = this.factionNames.systemNames();
    return factionProgresses(this.minis(), this.minisStore.partOf())
      .map(({ factionId, ...progress }) => ({
        ...progress,
        ...(factionId === undefined
          ? {}
          : { name: names.get(factionId) ?? factionId, systemName: systemNames.get(factionId) }),
      }))
      .sort(
        (a, b) =>
          Number(a.name === undefined) - Number(b.name === undefined) ||
          b.miniCount - a.miniCount ||
          (a.name ?? '').localeCompare(b.name ?? ''),
      );
  });
}
