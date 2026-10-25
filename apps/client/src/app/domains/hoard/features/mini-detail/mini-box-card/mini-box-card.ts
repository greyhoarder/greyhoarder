import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { type Box, type Kit, kitName } from '@greyhoarder/domain/hoard';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronRight } from '@ng-icons/lucide';
import { kitParts } from '../../../models/mini-build';
import { EitherOrName } from '../../../ui/either-or-name/either-or-name';
import { formatDate } from '../../../util/format-date';
import { kitMeta } from '../../../util/kit-labels';

/**
 * The box the minis of the page come from, linking to it, with the parts its kit suggests for the
 * name they are built as.
 */
@Component({
  selector: 'app-mini-box-card',
  imports: [RouterLink, NgIcon, EitherOrName],
  providers: [provideIcons({ lucideChevronRight })],
  templateUrl: './mini-box-card.html',
  host: {
    class: 'flex flex-col gap-4 rounded-xl border bg-card p-5',
    '[attr.data-testid]': '"mini-box"',
  },
})
export class MiniBoxCard {
  readonly box = input.required<Box>();
  /** Left out while loading, when it can't be loaded and for boxes without a kit. */
  readonly kit = input<Kit>();
  /** How far the whole box is, 0 to 100. */
  readonly percent = input.required<number>();
  /** What the minis are built as; maybe none yet. */
  readonly name = input.required<string>();

  /** The kit's name, e.g. "Lootas / Burna Boyz"; without a kit the box's name. */
  protected readonly title = computed(() => {
    const kit = this.kit();
    return kit ? kitName(kit) : this.box().name;
  });
  protected readonly meta = computed(() => {
    const kit = this.kit();
    return kit && kitMeta(kit);
  });
  protected readonly added = computed(
    () => `Added ${formatDate(this.box().addedOn)} · box at ${this.percent()}%`,
  );
  protected readonly suggestedParts = computed(() => {
    const kit = this.kit();
    return kit && this.name() !== '' ? kitParts(kit, this.name()) : [];
  });
}
