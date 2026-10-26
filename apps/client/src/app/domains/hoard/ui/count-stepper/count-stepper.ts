import { Component, input, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideMinus, lucidePlus } from '@ng-icons/lucide';

/** "− {n} + of {N}": how many minis of a row to act on, from 1 to all of them. */
@Component({
  selector: 'app-count-stepper',
  imports: [NgIcon],
  providers: [provideIcons({ lucideMinus, lucidePlus })],
  template: `
    <div class="flex h-10 items-center rounded-lg border" role="group" [attr.aria-label]="label()">
      <button
        type="button"
        class="flex size-10 items-center justify-center text-foreground disabled:opacity-50"
        aria-label="One fewer"
        [attr.data-testid]="testId() + '-less'"
        [disabled]="count() <= 1"
        (click)="changed.emit(-1)"
      >
        <ng-icon name="lucideMinus" size="16" />
      </button>
      <span
        class="w-6 text-center font-semibold text-foreground tabular-nums"
        aria-live="polite"
        [attr.data-testid]="testId() + '-count'"
        >{{ count() }}</span
      >
      <button
        type="button"
        class="flex size-10 items-center justify-center text-foreground disabled:opacity-50"
        aria-label="One more"
        [attr.data-testid]="testId() + '-more'"
        [disabled]="count() >= max()"
        (click)="changed.emit(1)"
      >
        <ng-icon name="lucidePlus" size="16" />
      </button>
    </div>
    of {{ max() }}
  `,
  host: { class: 'flex items-center gap-2 text-sm text-muted-foreground' },
})
export class CountStepper {
  readonly count = input.required<number>();
  readonly max = input.required<number>();
  /** Names the stepper for screen readers, e.g. "How many to build". */
  readonly label = input.required<string>();
  /** Its buttons and count are `{testId}-less`, `{testId}-count` and `{testId}-more`. */
  readonly testId = input.required<string>();
  /** By one more or one fewer. */
  readonly changed = output<1 | -1>();
}
