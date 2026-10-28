import { computed, inject, Injectable, resource, signal } from '@angular/core';
import { type FoundFaction, HttpCatalogFactionsAdapter } from '../../../catalog/api';
import { MinisAddition } from '../../application/minis/minis-addition';

/**
 * The search for a faction to give to custom minis: open below the chips while choosing, offering
 * the catalog factions that match and are not chosen yet. Provided by the Add custom page.
 */
@Injectable()
export class FactionSearch {
  private readonly catalogFactions = inject(HttpCatalogFactionsAdapter);
  private readonly addition = inject(MinisAddition);

  readonly isOpen = signal(false);
  readonly query = signal('');

  private readonly matches = resource({
    params: () => this.query().trim() || undefined,
    loader: ({ params }) => this.catalogFactions.search(params),
  });
  readonly results = computed(() => {
    const chosen = new Set(this.addition.factions().map((faction) => faction.id));
    return this.matches.hasValue()
      ? this.matches.value().filter((faction) => !chosen.has(faction.id))
      : [];
  });

  /** Opens or closes the search, empty either way. */
  toggle(): void {
    this.isOpen.update((isOpen) => !isOpen);
    this.query.set('');
  }

  /** Gives the faction to the minis and closes the search. */
  choose(faction: FoundFaction): void {
    this.addition.addFaction({ id: faction.id, name: faction.name });
    this.isOpen.set(false);
    this.query.set('');
  }
}
