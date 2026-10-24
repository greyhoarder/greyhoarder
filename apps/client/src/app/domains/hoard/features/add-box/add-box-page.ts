import { Component, computed, inject, resource, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideChevronLeft,
  lucideCircleCheck,
  lucideScanBarcode,
  lucideSearch,
  lucideX,
} from '@ng-icons/lucide';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmInputGroupImports } from '@spartan-ng/helm/input-group';
import { HttpKitsAdapter } from '../../../catalog/api';
import { BoxesStore } from '../../data/boxes-store';
import { MinisStore } from '../../data/minis-store';
import { isBoxOfKit } from '../../models/box-row';
import { boxKitName } from '../../models/kit';
import { minisLabel } from '../../models/kit-labels';
import { type Kit, toKit } from '../../models/kit';
import type { BoxesToAdd } from '../../models/boxes-to-add';
import { newBoxes, today } from '../../models/new-box';
import { KitCard } from './kit-card/kit-card';

/**
 * Adding a box to the hoard: finding its kit in the catalog by name, product code or barcode,
 * and adding boxes of it from its opened card. Specified in docs/screens/add-box.md.
 */
@Component({
  selector: 'app-add-box-page',
  imports: [RouterLink, NgIcon, HlmButton, HlmInputGroupImports, KitCard],
  providers: [
    provideIcons({ lucideChevronLeft, lucideCircleCheck, lucideScanBarcode, lucideSearch, lucideX }),
  ],
  templateUrl: './add-box-page.html',
  host: { class: 'flex w-full flex-col gap-6 p-4 sm:p-8 lg:p-10' },
})
export class AddBoxPage {
  private readonly catalogKits = inject(HttpKitsAdapter);
  private readonly boxesStore = inject(BoxesStore);
  private readonly minisStore = inject(MinisStore);

  protected readonly query = signal('');
  protected readonly isSearching = computed(() => this.query().trim() !== '');
  protected readonly openKitId = signal<string | undefined>(undefined);
  /** What was added last, for the status bar. */
  protected readonly added = signal<string | undefined>(undefined);

  /** Idle while the search is empty; a newer search replaces the answer of an older one. */
  protected readonly matches = resource({
    params: () => this.query().trim() || undefined,
    loader: ({ params }) => this.catalogKits.search(params),
  });

  protected readonly kits = computed<Kit[]>(() => {
    if (!this.matches.hasValue()) {
      return [];
    }
    const { kits, containedKits } = this.matches.value();
    return kits.map((kit) => toKit(kit, containedKits));
  });

  protected readonly factionNames = computed<ReadonlyMap<string, string>>(() =>
    this.matches.hasValue() ? this.matches.value().factionNames : new Map(),
  );

  protected ownedBoxes(kit: Kit): number {
    return this.boxesStore.boxes().filter((box) => isBoxOfKit(box, kit)).length;
  }

  protected search(event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      this.query.set(event.target.value);
    }
  }

  protected toggle(kit: Kit): void {
    this.openKitId.update((id) => (id === kit.id ? undefined : kit.id));
  }

  protected add(kit: Kit, boxesToAdd: BoxesToAdd): void {
    const { boxes, minis } = newBoxes(kit, boxesToAdd, {
      addedOn: today(),
      newId: () => crypto.randomUUID(),
      factionNames: this.factionNames(),
    });
    this.boxesStore.add(boxes);
    this.minisStore.add(minis);
    const count = minis.reduce((sum, row) => sum + row.count, 0);
    const boxCount = boxes.length === 1 ? '1 box' : `${boxes.length} boxes`;
    this.added.set(`Added ${boxCount} of ${boxKitName(kit)} with ${minisLabel(count)} to your hoard.`);
    this.openKitId.set(undefined);
  }
}
