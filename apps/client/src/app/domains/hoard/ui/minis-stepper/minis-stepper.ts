import { Component, input, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideMinus, lucidePlus } from '@ng-icons/lucide';
import { HlmButton } from '@spartan-ng/helm/button';
import { minisLabel } from '../../util/kit-labels';

/** "− {n} minis +": how many alike minis to add, at least one. */
@Component({
  selector: 'app-minis-stepper',
  imports: [NgIcon, HlmButton],
  providers: [provideIcons({ lucideMinus, lucidePlus })],
  template: `
    <button
      hlmBtn
      variant="ghost"
      type="button"
      class="size-10"
      aria-label="One mini less"
      [attr.data-testid]="testId() + '-less'"
      [disabled]="count() <= 1"
      (click)="changed.emit(-1)"
    >
      <ng-icon name="lucideMinus" size="16" />
    </button>
    <span class="min-w-16 text-center text-sm" aria-live="polite" [attr.data-testid]="testId() + '-count'">{{
      label(count())
    }}</span>
    <button
      hlmBtn
      variant="ghost"
      type="button"
      class="size-10"
      aria-label="One mini more"
      [attr.data-testid]="testId() + '-more'"
      (click)="changed.emit(1)"
    >
      <ng-icon name="lucidePlus" size="16" />
    </button>
  `,
  host: {
    class: 'flex h-10 items-center rounded-lg border',
    role: 'group',
    'aria-label': 'Minis',
  },
})
export class MinisStepper {
  readonly count = input.required<number>();
  /** Its buttons and count are `{testId}-less`, `{testId}-count` and `{testId}-more`. */
  readonly testId = input.required<string>();
  /** By one more or one less. */
  readonly changed = output<1 | -1>();

  protected readonly label = minisLabel;
}
