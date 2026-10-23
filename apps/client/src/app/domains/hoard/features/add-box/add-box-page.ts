import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronLeft, lucideScanBarcode, lucideSearch } from '@ng-icons/lucide';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmInputGroupImports } from '@spartan-ng/helm/input-group';
import { RECENT_KIT_IDS, SAMPLE_KITS } from '../../data/sample-kits';
import { searchKits } from '../../util/kit-facts';
import type { KitOption } from '../../util/kit-option';
import { AddStepper } from './add-stepper/add-stepper';
import { KitCard } from './kit-card/kit-card';

/**
 * Adding a box to the hoard, step 1: finding its kit by name, product code
 * or barcode. Specified in docs/screens/add-box.md.
 */
@Component({
  selector: 'app-add-box-page',
  imports: [RouterLink, NgIcon, HlmButton, HlmInputGroupImports, AddStepper, KitCard],
  providers: [provideIcons({ lucideChevronLeft, lucideScanBarcode, lucideSearch })],
  templateUrl: './add-box-page.html',
  host: { class: 'flex w-full flex-col gap-8 p-4 sm:p-8 lg:p-10' },
})
export class AddBoxPage {
  protected readonly query = signal('');
  protected readonly isSearching = computed(() => this.query().trim() !== '');

  /** The recently used kits without a search, the matching kits with one. */
  protected readonly kits = computed<KitOption[]>(() =>
    this.isSearching()
      ? searchKits(SAMPLE_KITS, this.query())
      : RECENT_KIT_IDS.flatMap((id) => SAMPLE_KITS.filter((kit) => kit.id === id)),
  );

  protected search(event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      this.query.set(event.target.value);
    }
  }
}
