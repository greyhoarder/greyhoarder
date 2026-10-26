import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, input, linkedSignal, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePlus, lucideSearch } from '@ng-icons/lucide';
import { type PartOption, partOptions } from '../../models/part-options';

/** Tells the pickers apart for `aria-controls`. */
let nextId = 0;

/**
 * Where parts are picked for minis: a filter and the parts of the kit, the vocabulary and the range
 * as chips, and creating a part of the user's own. Unfolds below the part tiles while open.
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
  /** What the parts are offered from, but the filter text. */
  readonly source = input.required<Parameters<typeof partOptions>[0]>();
  /** For "From the kit · {box name}". */
  readonly boxName = input<string>();
  /** For "{range name} range", e.g. "Orks". */
  readonly rangeName = input<string>();
  /** An offered part, or the name of a new one. */
  readonly added = output<PartOption | string>();

  readonly id = `part-picker-${nextId++}`;

  /** Empty whenever the picker opens or closes. */
  protected readonly filter = linkedSignal({ source: this.isOpen, computation: () => '' });

  protected readonly options = computed(() => partOptions(this.source(), this.filter()));

  protected typeFilter(event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      this.filter.set(event.target.value);
    }
  }

  /** Adds an offered part, or creates one by name; the filter empties, the picker stays open. */
  protected add(part: PartOption | string): void {
    this.added.emit(part);
    this.filter.set('');
  }
}
