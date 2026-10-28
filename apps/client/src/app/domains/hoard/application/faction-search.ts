import { computed, inject, Injectable, resource, signal } from '@angular/core';
import { HttpCatalogFactionsAdapter } from '../../catalog/api';

/**
 * The search for a faction to give to minis: open in a popover while choosing, offering the catalog
 * factions that match. Provided by each page that gives minis factions.
 */
@Injectable()
export class FactionSearch {
  private readonly catalogFactions = inject(HttpCatalogFactionsAdapter);

  readonly isOpen = signal(false);
  readonly query = signal('');

  private readonly matches = resource({
    params: () => this.query().trim() || undefined,
    loader: ({ params }) => this.catalogFactions.search(params),
  });
  readonly results = computed(() => (this.matches.hasValue() ? this.matches.value() : []));

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
