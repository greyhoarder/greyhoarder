import { Component, computed, input, output } from '@angular/core';
import type { SprueMinis } from '@greyhoarder/domain/hoard';
import { RowStepper } from '../row-stepper/row-stepper';

/**
 * One row of minis a kit puts on the sprue: what they can be built as and their parts, and at the
 * right end a stepper counting them. What is projected, e.g. "of 10", shows beside the stepper.
 */
@Component({
  selector: 'app-sprue-row',
  imports: [RowStepper],
  template: `
    @let shown = row();
    @if (shown.isUndecided) {
      <span class="flex min-w-0 flex-1 flex-col gap-0.5">
        <span [attr.data-testid]="testId() + '-name'">{{ name() }}</span>
        <span class="text-sm text-muted-foreground" [attr.data-testid]="testId() + '-builds'"
          >Each can become {{ shown.builds.join(' or ') }}.</span
        >
        @if (shown.parts.length > 0) {
          <span class="mt-1 flex flex-wrap gap-x-3 gap-y-1.5">
            @for (part of shown.parts; track part) {
              <span
                class="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                [attr.data-testid]="testId() + '-part'"
                >{{ part }}</span
              >
            }
          </span>
        }
      </span>
    } @else {
      <span class="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-1.5">
        <span [attr.data-testid]="testId() + '-name'">{{ name() }}</span>
        @for (part of shown.parts; track part) {
          <span
            class="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground"
            [attr.data-testid]="testId() + '-part'"
            >{{ part }}</span
          >
        }
      </span>
    }
    <span class="flex shrink-0 items-center gap-2">
      <app-row-stepper
        [testId]="testId()"
        [count]="count()"
        [name]="name()"
        [isDisabled]="isDisabled()"
        (changed)="changed.emit($event)"
      />
      <ng-content />
    </span>
  `,
  host: { class: 'flex flex-1 items-center gap-3' },
})
export class SprueRow {
  readonly row = input.required<SprueMinis>();
  /** How many minis the row puts on the sprue. */
  readonly count = input.required<number>();
  /** Prefix of the test IDs of its stepper, name, parts and builds, e.g. "add-box-slot". */
  readonly testId = input.required<string>();
  /** While saving, for example. */
  readonly isDisabled = input(false);
  /** By one more or one fewer. */
  readonly changed = output<1 | -1>();

  /** The kit's name for undecided rows, otherwise what the minis can be built as, e.g. "Boy or Nob". */
  protected readonly name = computed(() => {
    const row = this.row();

    return row.isUndecided ? row.name : row.builds.join(' or ');
  });
}
