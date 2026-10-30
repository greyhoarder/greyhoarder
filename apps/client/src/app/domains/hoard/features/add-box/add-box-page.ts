import { Component, computed, inject, resource, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronLeft, lucideCircleCheck, lucideScanBarcode, lucideSearch, lucideX } from '@ng-icons/lucide';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmInputGroupImports } from '@spartan-ng/helm/input-group';
import { HttpKitsAdapter } from '../../../catalog/api';
import { boxKitName, type Kit, toKit } from '@greyhoarder/domain/hoard';
import { BoxesStore } from '../../data/boxes-store';
import { MinisStore } from '../../data/minis-store';
import { HttpBoxesAdapter } from '../../infrastructure/http-boxes-adapter';
import { isFromKit } from '../../models/box';
import type { BoxesToAdd } from '../../models/boxes-to-add';
import { minisLabel } from '../../util/kit-labels';
import { today } from '../../util/today';
import { KitCard } from './kit-card/kit-card';

/**
 * Adding a box to the hoard: finding its kit in the catalog by name, product code or barcode,
 * and adding boxes of it from its opened card. Specified in docs/screens/add-box.md.
 */
@Component({
  selector: 'app-add-box-page',
  imports: [RouterLink, NgIcon, HlmButton, HlmInputGroupImports, KitCard],
  providers: [provideIcons({ lucideChevronLeft, lucideCircleCheck, lucideScanBarcode, lucideSearch, lucideX })],
  templateUrl: './add-box-page.html',
  host: { class: 'flex w-full flex-col gap-6 p-4 sm:p-8 lg:p-10' },
})
export class AddBoxPage {
  private readonly catalogKits = inject(HttpKitsAdapter);
  private readonly boxesAdapter = inject(HttpBoxesAdapter);
  private readonly boxesStore = inject(BoxesStore);
  private readonly minisStore = inject(MinisStore);

  protected readonly query = signal('');
  protected readonly isSearching = computed(() => this.query().trim() !== '');
  protected readonly openKitId = signal<string | undefined>(undefined);
  /** What was added last, for the status bar. */
  protected readonly added = signal<string | undefined>(undefined);
  protected readonly hasAddFailed = signal(false);

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
    return this.boxesStore.boxes().filter((box) => isFromKit(box, kit)).length;
  }

  protected search(event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      this.query.set(event.target.value);
    }
  }

  protected toggle(kit: Kit): void {
    this.openKitId.update((id) => (id === kit.id ? undefined : kit.id));
  }

  /** The server creates the boxes and their minis; the stores then fetch the hoard again. */
  protected async add(kit: Kit, boxesToAdd: BoxesToAdd): Promise<void> {
    this.added.set(undefined);
    this.hasAddFailed.set(false);
    let addedBoxes;
    try {
      addedBoxes = await this.boxesAdapter.add(kit.id, boxesToAdd, today());
    } catch {
      // The open card keeps what the user chose, so they can try again.
      this.hasAddFailed.set(true);
      return;
    }
    const { boxes, minis } = addedBoxes;
    this.boxesStore.reload();
    this.minisStore.reload();
    const count = minis.length;
    const boxCount = boxes.length === 1 ? '1 box' : `${boxes.length} boxes`;
    this.added.set(`Added ${boxCount} of ${boxKitName(kit)} with ${minisLabel(count)} to your hoard.`);
    this.openKitId.set(undefined);
  }
}
