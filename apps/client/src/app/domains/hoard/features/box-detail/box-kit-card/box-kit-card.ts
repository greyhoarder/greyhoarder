import { Component, computed, input } from '@angular/core';
import type { Kit } from '@greyhoarder/domain/hoard';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { type ArmySection, type KitRow, kitSections } from '../../../models/army-sections';
import { ArmyHeading } from '../../../ui/army-heading/army-heading';
import { kitMeta } from '../../../util/kit-labels';

/** The kit a box was added from, as it was then, with what it suggests for the minis. */
@Component({
  selector: 'app-box-kit-card',
  imports: [HlmBadge, ArmyHeading],
  templateUrl: './box-kit-card.html',
  host: {
    class: 'flex flex-col gap-4 rounded-xl border bg-card p-5',
    '[attr.data-testid]': '"box-kit"',
  },
})
export class BoxKitCard {
  readonly kit = input.required<Kit>();
  /** The names of the kit's factions, by id. */
  readonly factionNames = input<ReadonlyMap<string, string>>(new Map());

  protected readonly meta = computed(() => kitMeta(this.kit()));
  /** One row per slot, as a box of the kit puts its minis on the sprue; the either-or row first. */
  protected readonly sections = computed(() => kitSections(this.kit(), this.factionNames()));

  protected sectionCount(section: ArmySection<KitRow>): number {
    return section.items.reduce((sum, { kind }) => sum + kind.count, 0);
  }
}
