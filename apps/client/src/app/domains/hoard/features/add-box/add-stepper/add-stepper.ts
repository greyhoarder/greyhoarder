import { Component, input } from '@angular/core';

/** The steps of adding a box as segments; the current one is gold and bold. */
@Component({
  selector: 'app-add-stepper',
  template: `
    <ol class="grid grid-cols-3 gap-3" aria-label="Steps">
      @for (step of steps; track step) {
        <li
          class="flex flex-col gap-2 text-sm text-muted-foreground aria-[current=step]:font-semibold aria-[current=step]:text-foreground"
          [attr.aria-current]="$index === current() ? 'step' : null"
          data-testid="add-box-step"
        >
          <span
            class="h-1 rounded-full"
            [class]="$index <= current() ? 'bg-primary' : 'bg-muted'"
            aria-hidden="true"
          ></span>
          {{ $index + 1 }}. {{ step }}
        </li>
      }
    </ol>
  `,
})
export class AddStepper {
  /** Zero-based index of the current step. */
  readonly current = input.required<number>();

  protected readonly steps = ['Find the kit', 'Check', 'Done'];
}
