import { Component, computed, input } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import { type Box, type BoxKitReference, type Kit, kitName } from '@greyhoarder/domain/hoard';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronRight } from '@ng-icons/lucide';
import { kitParts } from '../../../models/mini-build';
import { EitherOrName } from '../../../ui/either-or-name/either-or-name';
import { formatDate } from '../../../util/format-date';
import { kitMeta } from '../../../util/kit-labels';

/**
 * The box the minis of the page come from, linking to it, or for a mini without a box the catalog
 * kit it was added from; with the parts the kit suggests for the name they are built as.
 */
@Component({
  selector: 'app-mini-box-card',
  imports: [NgTemplateOutlet, RouterLink, NgIcon, EitherOrName],
  providers: [provideIcons({ lucideChevronRight })],
  templateUrl: './mini-box-card.html',
  host: {
    class: 'flex flex-col gap-4 rounded-xl border bg-card p-5',
    '[attr.data-testid]': '"mini-box"',
  },
})
export class MiniBoxCard {
  /** Left out for a mini without a box, which shows the kit it was added from. */
  readonly box = input<Box>();
  /** Left out while loading, when it can't be loaded and for boxes without a kit. */
  readonly kit = input<Kit>();
  /** The kit as the mini without a box recorded it, named while the kit loads. */
  readonly kitReference = input<BoxKitReference>();
  /** How far the whole box is, 0 to 100; left out with the box. */
  readonly percent = input<number>();
  /** What the minis are built as; maybe none yet. */
  readonly name = input.required<string>();

  /** The kit's name, e.g. "Lootas / Burna Boyz"; without a kit the box's name. */
  protected readonly title = computed(() => {
    const kit = this.kit();
    return kit ? kitName(kit) : (this.box()?.name ?? this.kitReference()?.name ?? '');
  });
  protected readonly meta = computed(() => {
    const kit = this.kit();
    return kit && kitMeta(kit);
  });
  protected readonly added = computed(() => {
    const box = this.box();
    const percent = this.percent();
    return box && percent !== undefined
      ? `Added ${formatDate(box.addedOn)} · box #${box.number} at ${percent}%`
      : undefined;
  });
  protected readonly suggestedParts = computed(() => {
    const kit = this.kit();
    return kit && this.name() !== '' ? kitParts(kit, this.name()) : [];
  });
}
