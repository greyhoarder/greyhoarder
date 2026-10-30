import { computed, inject, Injectable, resource, signal } from '@angular/core';
import { factionKey, type OwnFaction } from '@greyhoarder/domain/hoard';
import { HttpCatalogFactionsAdapter } from '../../catalog/api';
import { MinisStore } from '../data/minis-store';
import { ownFactionsOf } from '../models/own-factions';
import { FactionNames } from './faction-names';

/** The own factions whose name contains the query, ignoring case; none for an empty query. */
export function matchingOwnFactions(factions: readonly OwnFaction[], query: string): OwnFaction[] {
  const key = factionKey(query);
  return key === '' ? [] : factions.filter((faction) => factionKey(faction.name).includes(key));
}

/**
 * The search for a faction to give to minis: open in a popover while choosing, offering the user's
 * own factions and the catalog factions that match. Provided by each page that gives minis factions.
 */
@Injectable()
export class FactionSearch {
  private readonly catalogFactions = inject(HttpCatalogFactionsAdapter);
  private readonly minisStore = inject(MinisStore);
  private readonly factionNames = inject(FactionNames);

  readonly isOpen = signal(false);
  readonly query = signal('');

  private readonly matches = resource({
    params: () => this.query().trim() || undefined,
    loader: ({ params }) => this.catalogFactions.search(params),
  });
  readonly results = computed(() => (this.matches.hasValue() ? this.matches.value() : []));
  readonly ownResults = computed(() =>
    matchingOwnFactions(
      ownFactionsOf(this.minisStore.minis(), this.factionNames.names()),
      this.query(),
    ),
  );

  /** Opens or closes the search, empty either way. */
  toggle(): void {
    this.isOpen.update((isOpen) => !isOpen);
    this.query.set('');
  }

  /** Closes the search once a faction was chosen. */
  close(): void {
    this.isOpen.set(false);
    this.query.set('');
  }
}
