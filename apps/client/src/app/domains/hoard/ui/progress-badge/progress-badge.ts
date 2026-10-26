import { Component, computed, input } from '@angular/core';
import type { BoxProgress } from '../../models/box-progress';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { PROGRESS_LABELS } from '../../util/box-labels';

/**
 * How far a box has come, as a badge in the colors of the status badge:
 * grey while untouched or started, gold once done, outlined once all minis are gone.
 */
@Component({
  selector: 'app-progress-badge',
  imports: [HlmBadge],
  template: `
    <span
      hlmBadge
      variant="outline"
      class="h-6 border-transparent px-2.5 text-sm font-medium data-[progress=all-gone]:border-border data-[progress=all-gone]:text-muted-foreground data-[progress=done]:bg-primary data-[progress=done]:text-primary-foreground data-[progress=empty]:border-border data-[progress=empty]:text-muted-foreground data-[progress=started]:bg-muted-foreground/70 data-[progress=started]:text-background data-[progress=untouched]:bg-muted-foreground/40"
      [attr.data-progress]="progress()"
      data-testid="hoard-box-progress"
    >
      {{ label() }}
    </span>
  `,
})
export class ProgressBadge {
  readonly progress = input.required<BoxProgress>();

  protected readonly label = computed(() => PROGRESS_LABELS[this.progress()]);
}
