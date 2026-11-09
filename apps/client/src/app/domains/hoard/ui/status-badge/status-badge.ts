import { Component, computed, input } from '@angular/core';
import type { HobbyStatus } from '@greyhoarder/domain/hoard';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { STATUS_COLORS, STATUS_TEXT_COLORS } from '../../util/status-colors';
import { STATUS_LABELS } from '../../util/status-labels';

/**
 * The hobby status of a mini as a badge in the status's color. The color fills an inner span, so
 * it wins over the badge's own variant colors.
 */
@Component({
  selector: 'app-status-badge',
  imports: [HlmBadge],
  template: `
    <span
      hlmBadge
      variant="outline"
      class="h-6 border-transparent p-0 text-sm font-medium"
      [attr.data-status]="status()"
      data-testid="hoard-status"
    >
      <span class="flex h-full items-center px-2.5" [class]="colors()">{{ label() }}</span>
    </span>
  `,
})
export class StatusBadge {
  readonly status = input.required<HobbyStatus>();

  protected readonly label = computed(() => STATUS_LABELS[this.status()]);
  protected readonly colors = computed(() => [STATUS_COLORS[this.status()], STATUS_TEXT_COLORS[this.status()]]);
}
