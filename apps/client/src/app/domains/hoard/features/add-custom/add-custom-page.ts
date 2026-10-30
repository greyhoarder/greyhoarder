import { Component, computed, inject, resource, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { hobbyStatuses } from '@greyhoarder/domain/hoard';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronLeft } from '@ng-icons/lucide';
import { HlmButton } from '@spartan-ng/helm/button';
import { HttpCatalogMinisAdapter } from '../../../catalog/api';
import { FactionSearch } from '../../application/faction-search';
import { MinisAddition } from '../../application/minis/minis-addition';
import { MinisStore } from '../../data/minis-store';
import { AddedBar } from '../../ui/added-bar/added-bar';
import { MinisStepper } from '../../ui/minis-stepper/minis-stepper';
import { PartTiles } from '../../ui/part-tiles/part-tiles';
import { StatusChoice } from '../../ui/status-choice/status-choice';
import { FactionPicker } from './faction-picker/faction-picker';
import { NameField } from './name-field/name-field';
import { catalogNameSuggestions, ownNameSuggestions } from './name-suggestions';

/**
 * Adding minis the user put together: a name, factions, status, parts and notes of their own,
 * helped by the names of the hoard and the catalog. Specified in docs/screens/add-custom.md.
 */
@Component({
  selector: 'app-add-custom-page',
  imports: [
    RouterLink,
    NgIcon,
    HlmButton,
    AddedBar,
    FactionPicker,
    MinisStepper,
    NameField,
    PartTiles,
    StatusChoice,
  ],
  providers: [provideIcons({ lucideChevronLeft }), MinisAddition, FactionSearch],
  templateUrl: './add-custom-page.html',
  host: { class: 'flex w-full flex-col gap-6 p-4 sm:p-8 lg:p-10' },
})
export class AddCustomPage {
  private readonly catalogMinis = inject(HttpCatalogMinisAdapter);
  private readonly minisStore = inject(MinisStore);
  protected readonly addition = inject(MinisAddition);
  protected readonly factionSearch = inject(FactionSearch);

  /** What the user put together is no longer on the sprue. */
  protected readonly statuses = hobbyStatuses.filter((status) => status !== 'sprue');
  protected readonly isNameMissing = signal(false);

  protected readonly ownNames = computed(() =>
    ownNameSuggestions(this.minisStore.minis(), this.addition.name()),
  );
  private readonly nameMatches = resource({
    params: () => this.addition.name().trim() || undefined,
    loader: ({ params }) => this.catalogMinis.search(params),
  });
  protected readonly catalogNames = computed(() =>
    this.nameMatches.hasValue()
      ? catalogNameSuggestions(this.nameMatches.value(), this.addition.name())
      : [],
  );

  constructor() {
    this.addition.start();
  }

  protected changeName(name: string): void {
    this.addition.name.set(name);
    if (name.trim() !== '') {
      this.isNameMissing.set(false);
    }
  }

  /** Gives the faction to the minis and closes the search. */
  protected chooseFaction({ id, name }: { readonly id: string; readonly name: string }): void {
    this.addition.addFaction({ id, name });
    this.factionSearch.close();
  }

  /** Gives the minis a new own faction of that name and closes the search. */
  protected createFaction(name: string): void {
    this.addition.addFaction({ name });
    this.factionSearch.close();
  }

  protected changeNotes(event: Event): void {
    if (event.target instanceof HTMLTextAreaElement) {
      this.addition.notes.set(event.target.value);
    }
  }

  protected async add(): Promise<void> {
    if (this.addition.name().trim() === '') {
      this.isNameMissing.set(true);
      return;
    }
    await this.addition.add();
  }
}
