import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject, input, linkedSignal, resource } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePlus, lucideSearch } from '@ng-icons/lucide';
import { HttpCatalogPartsAdapter } from '../../../../catalog/api';
import { FactionNamesStore } from '../../../data/faction-names-store';
import { PartsStore } from '../../../data/parts-store';
import { type PartOption, partOptions } from '../../../models/part-options';
import { eitherOrText } from '../../../util/either-or';
import { MiniEditor } from '../mini-editor';

/**
 * Where parts are picked for the minis of the page: a filter and the parts of the kit, the
 * vocabulary and the range as chips, and creating a part of the user's own. Unfolds below the part
 * tiles while open.
 */
@Component({
  selector: 'app-part-picker',
  imports: [NgTemplateOutlet, NgIcon],
  providers: [provideIcons({ lucidePlus, lucideSearch })],
  templateUrl: './part-picker.html',
  // Unfolding by grid rows needs no measured height; Tailwind has no class for these values.
  styles: `
    [data-part-picker] {
      display: grid;
      grid-template-rows: 0fr;
      opacity: 0;
      transition:
        grid-template-rows 260ms ease,
        opacity 140ms ease;
    }
    [data-part-picker][data-open='true'] {
      grid-template-rows: 1fr;
      opacity: 1;
      transition:
        grid-template-rows 260ms ease,
        opacity 200ms ease 60ms;
    }
    @media (prefers-reduced-motion: reduce) {
      [data-part-picker],
      [data-part-picker][data-open='true'] {
        transition: none;
      }
    }
  `,
  host: { class: 'block' },
})
export class PartPicker {
  readonly isOpen = input.required<boolean>();

  private readonly editor = inject(MiniEditor);
  private readonly partsStore = inject(PartsStore);
  private readonly factionNames = inject(FactionNamesStore);
  private readonly catalogParts = inject(HttpCatalogPartsAdapter);

  /** Empty whenever the picker opens or closes. */
  protected readonly filter = linkedSignal({ source: this.isOpen, computation: () => '' });

  /** The parts of the catalog kits of the minis' factions and those they are part of. */
  private readonly rangeParts = resource({
    params: () => {
      const factionIds = this.editor.factionIds();
      return factionIds.length > 0 ? { factionIds } : undefined;
    },
    loader: ({ params: { factionIds } }) => this.catalogParts.rangeParts(factionIds),
  });

  protected readonly boxName = computed(() => {
    const box = this.editor.box();
    return box && eitherOrText(box.name);
  });
  /** Named after the minis' first faction, e.g. "Orks range". */
  protected readonly rangeName = computed(() => {
    const [factionId] = this.editor.factionIds();
    return factionId === undefined
      ? undefined
      : (this.factionNames.names().get(factionId) ?? factionId);
  });
  protected readonly options = computed(() =>
    partOptions(
      {
        kit: this.editor.kit(),
        sprueName: this.editor.mini()?.sprueName,
        vocabulary: this.partsStore.parts(),
        range: this.rangeParts.hasValue() ? this.rangeParts.value() : [],
        carried: this.editor.parts().map((part) => part.name),
      },
      this.filter(),
    ),
  );

  protected typeFilter(event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      this.filter.set(event.target.value);
    }
  }

  /** Adds an offered part, or creates one by name; the filter empties, the picker stays open. */
  protected add(part: PartOption | string): void {
    this.editor.addPart(part);
    this.filter.set('');
  }
}
