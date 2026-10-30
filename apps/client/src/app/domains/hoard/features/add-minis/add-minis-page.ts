import { Component, computed, inject, resource, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronLeft, lucideSearch } from '@ng-icons/lucide';
import { HlmInputGroupImports } from '@spartan-ng/helm/input-group';
import { HttpCatalogMinisAdapter } from '../../../catalog/api';
import { MinisAddition } from '../../application/minis/minis-addition';
import { MinisStore } from '../../data/minis-store';
import { AddedBar } from '../../ui/added-bar/added-bar';
import { AddMinisForm } from './add-minis-form/add-minis-form';
import { CatalogMiniCard } from './catalog-mini-card/catalog-mini-card';
import { type MiniOffer, toMiniOffers } from './mini-offer';

/**
 * Adding minis without their box: finding a mini the catalog knows by its name, kit or faction, and
 * adding alike ones of it in a state from its opened card. Specified in docs/screens/add-minis.md.
 */
@Component({
  selector: 'app-add-minis-page',
  imports: [RouterLink, NgIcon, HlmInputGroupImports, AddedBar, AddMinisForm, CatalogMiniCard],
  providers: [provideIcons({ lucideChevronLeft, lucideSearch }), MinisAddition],
  templateUrl: './add-minis-page.html',
  host: { class: 'flex w-full flex-col gap-6 p-4 sm:p-8 lg:p-10' },
})
export class AddMinisPage {
  private readonly catalogMinis = inject(HttpCatalogMinisAdapter);
  private readonly minisStore = inject(MinisStore);
  protected readonly addition = inject(MinisAddition);

  protected readonly query = signal('');
  protected readonly isSearching = computed(() => this.query().trim() !== '');
  protected readonly openKey = signal<string | undefined>(undefined);
  protected readonly formId = 'add-minis-form';

  /** Idle while the search is empty; a newer search replaces the answer of an older one. */
  protected readonly matches = resource({
    params: () => this.query().trim() || undefined,
    loader: ({ params }) => this.catalogMinis.search(params),
  });

  protected readonly offers = computed(() =>
    this.matches.hasValue() ? toMiniOffers(this.matches.value(), this.minisStore.minis()) : [],
  );

  protected search(event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      this.query.set(event.target.value);
    }
  }

  /** Opening a card starts its form anew; opening it again closes it. */
  protected toggle({ key, mini, factionName }: MiniOffer): void {
    if (this.openKey() === key) {
      this.openKey.set(undefined);
      return;
    }
    this.openKey.set(key);
    const { name, factionId, parts, kit } = mini;
    this.addition.start({
      name,
      kit: { id: kit.id, version: kit.version },
      ...(factionId === undefined ? {} : { faction: { id: factionId, name: factionName ?? factionId } }),
      suggestedParts: parts,
    });
  }
}
