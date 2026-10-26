import { Component, input, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideDroplet, lucideMagnet, lucidePlus, lucideX } from '@ng-icons/lucide';
import type { PartOption, partOptions } from '../../models/part-options';
import { PartPicker } from '../part-picker/part-picker';

/** Tells the sections apart for their labels. */
let nextId = 0;

/** A part as a tile shows it. */
export interface PartTile {
  readonly name: string;
  readonly isSwappable: boolean;
}

/**
 * The "Parts" section: one tile per part with its swappable toggle and a remove button, and the
 * "Add a part" tile that opens the part picker below them (docs/screens/mini.md).
 */
@Component({
  selector: 'app-part-tiles',
  imports: [NgIcon, PartPicker],
  providers: [provideIcons({ lucideDroplet, lucideMagnet, lucidePlus, lucideX })],
  templateUrl: './part-tiles.html',
  host: { class: 'flex flex-col gap-4', role: 'group', '[attr.aria-labelledby]': 'headingId' },
})
export class PartTiles {
  readonly parts = input.required<readonly PartTile[]>();
  /** Muted, on the right of the heading. */
  readonly hint = input('');
  readonly isPickerOpen = input(false);
  /** What the picker offers parts from, but the filter text. */
  readonly source = input.required<Parameters<typeof partOptions>[0]>();
  readonly boxName = input<string>();
  readonly rangeName = input<string>();
  /** The index of the part. */
  readonly removed = output<number>();
  /** The index of the part. */
  readonly swappableToggled = output<number>();
  readonly added = output<PartOption | string>();
  readonly pickerToggled = output();

  protected readonly headingId = `part-tiles-${nextId++}-heading`;
}
