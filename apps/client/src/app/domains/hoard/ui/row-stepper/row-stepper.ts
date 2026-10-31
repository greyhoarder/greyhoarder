import { Component, input, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideMinus, lucidePlus } from '@ng-icons/lucide';

/** "− {n} +": how many minis a row puts on the sprue, from none up without limit. */
@Component({
  selector: 'app-row-stepper',
  imports: [NgIcon],
  providers: [provideIcons({ lucideMinus, lucidePlus })],
  template: `
    <button
      type="button"
      class="flex size-8 items-center justify-center rounded-md text-foreground transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:opacity-50"
      [attr.data-testid]="testId() + '-less'"
      [attr.aria-label]="'One fewer: ' + name()"
      [disabled]="count() === 0 || isDisabled()"
      (click)="changed.emit(-1)"
    >
      <ng-icon name="lucideMinus" size="14" />
    </button>
    <span
      class="w-6 text-center font-semibold tabular-nums"
      aria-live="polite"
      [attr.data-testid]="testId() + '-count'"
      >{{ count() }}</span
    >
    <button
      type="button"
      class="flex size-8 items-center justify-center rounded-md text-foreground transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:opacity-50"
      [attr.data-testid]="testId() + '-more'"
      [attr.aria-label]="'One more: ' + name()"
      [disabled]="isDisabled()"
      (click)="changed.emit(1)"
    >
      <ng-icon name="lucidePlus" size="14" />
    </button>
  `,
  host: {
    class: 'flex shrink-0 items-center rounded-lg border',
    role: 'group',
    '[attr.aria-label]': 'name()',
  },
})
export class RowStepper {
  readonly count = input.required<number>();
  /** The row's name, for screen readers. */
  readonly name = input.required<string>();
  /** Prefix of the test IDs of its count and buttons, e.g. "add-box-slot". */
  readonly testId = input.required<string>();
  /** While saving, for example. */
  readonly isDisabled = input(false);
  /** By one more or one fewer. */
  readonly changed = output<1 | -1>();
}
