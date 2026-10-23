import { Component, computed, inject, resource, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronLeft, lucideScanBarcode, lucideSearch } from '@ng-icons/lucide';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmInputGroupImports } from '@spartan-ng/helm/input-group';
import { HttpKitsAdapter } from '../../../catalog/api';
import { type KitOption, toKitOption } from '../../util/kit-option';
import { AddStepper } from './add-stepper/add-stepper';
import { KitCard } from './kit-card/kit-card';

/**
 * Adding a box to the hoard, step 1: finding its kit in the catalog by name,
 * product code or barcode. Specified in docs/screens/add-box.md.
 */
@Component({
  selector: 'app-add-box-page',
  imports: [RouterLink, NgIcon, HlmButton, HlmInputGroupImports, AddStepper, KitCard],
  providers: [provideIcons({ lucideChevronLeft, lucideScanBarcode, lucideSearch })],
  templateUrl: './add-box-page.html',
  host: { class: 'flex w-full flex-col gap-8 p-4 sm:p-8 lg:p-10' },
})
export class AddBoxPage {
  private readonly catalogKits = inject(HttpKitsAdapter);

  protected readonly query = signal('');
  protected readonly isSearching = computed(() => this.query().trim() !== '');

  /** Idle while the search is empty; a newer search replaces the answer of an older one. */
  protected readonly matches = resource({
    params: () => this.query().trim() || undefined,
    loader: ({ params }) => this.catalogKits.search(params),
  });

  protected readonly kits = computed<KitOption[]>(() => {
    if (!this.matches.hasValue()) {
      return [];
    }
    const { kits, factionNames } = this.matches.value();
    return kits.map((kit) => toKitOption(kit, factionNames));
  });

  protected search(event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      this.query.set(event.target.value);
    }
  }
}
