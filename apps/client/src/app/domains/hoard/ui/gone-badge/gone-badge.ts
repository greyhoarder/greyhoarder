import { Component, computed, input } from '@angular/core';
import type { DepartureReason } from '@greyhoarder/domain/hoard';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { DEPARTURE_LABELS } from '../../util/status-labels';

/** Why gone minis left the hoard, as an outlined badge in place of their status badge. */
@Component({
  selector: 'app-gone-badge',
  imports: [HlmBadge],
  template: `
    <span
      hlmBadge
      variant="outline"
      class="h-6 px-2.5 text-sm font-medium text-muted-foreground"
      [attr.data-reason]="reason()"
      data-testid="hoard-gone"
    >
      {{ label() }}
    </span>
  `,
})
export class GoneBadge {
  readonly reason = input.required<DepartureReason>();

  protected readonly label = computed(() => DEPARTURE_LABELS[this.reason()]);
}
