import { Component, computed, input, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideEllipsisVertical } from '@ng-icons/lucide';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { HlmButton } from '@spartan-ng/helm/button';
import type { MiniRow } from '../../../data/mini-row';
import { minisLabel } from '../../../util/kit-labels';
import { StatusBadge } from '../../../ui/status-badge/status-badge';

/**
 * One row of alike minis of a box as a card, like on the Minis tab but without the box, since
 * every mini here comes from it. The card is a button named after the minis.
 */
@Component({
  selector: 'app-box-mini-card',
  imports: [NgIcon, HlmBadge, HlmButton, StatusBadge],
  providers: [provideIcons({ lucideEllipsisVertical })],
  templateUrl: './box-mini-card.html',
  host: {
    class:
      'flex items-center gap-2 rounded-xl border bg-card pr-2 transition-colors hover:bg-muted/40',
    '[attr.data-testid]': '"box-mini"',
  },
})
export class BoxMiniCard {
  readonly row = input.required<MiniRow>();

  /** "1 mini" or "{n} minis", for screen readers. */
  protected readonly minisLabel = minisLabel;
  /** Factions are shown only when they differ from these. */
  readonly boxFactions = input.required<readonly string[]>();
  readonly opened = output();

  protected readonly nameId = computed(() => `box-mini-${this.row().id}-name`);
  protected readonly detailsId = computed(() => `box-mini-${this.row().id}-details`);

  /** Factions that differ from the box, then the parts; empty when there are neither. */
  protected readonly details = computed(() => {
    const { factions, parts } = this.row();
    const boxFactions = this.boxFactions();
    const isLikeBox =
      factions.length === boxFactions.length &&
      factions.every((faction) => boxFactions.includes(faction));
    return [isLikeBox ? '' : factions.join(', '), parts.join(' · ')]
      .filter((part) => part !== '')
      .join(' · ');
  });
}
