import { Component, computed, input } from '@angular/core';
import type { HobbyStatus } from '@greyhoarder/domain/hoard';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { STATUS_LABELS } from '../../../util/status-labels';

/**
 * The hobby status of a mini as a badge: grey while unpainted, lighter with
 * each step, gold once painted. The colors hang on `data-status`, so they
 * win over the badge's own variant colors.
 */
@Component({
  selector: 'app-status-badge',
  imports: [HlmBadge],
  template: `
    <span
      hlmBadge
      variant="outline"
      class="h-6 border-transparent px-2.5 text-sm font-medium data-[status=built]:bg-muted-foreground/40 data-[status=done]:bg-primary data-[status=done]:text-primary-foreground data-[status=painted]:bg-primary/60 data-[status=painted]:text-primary-foreground data-[status=primed]:bg-muted-foreground/70 data-[status=primed]:text-background data-[status=sprue]:bg-muted"
      [attr.data-status]="status()"
      data-testid="hoard-status"
    >
      {{ label() }}
    </span>
  `,
})
export class StatusBadge {
  readonly status = input.required<HobbyStatus>();

  protected readonly label = computed(() => STATUS_LABELS[this.status()]);
}
