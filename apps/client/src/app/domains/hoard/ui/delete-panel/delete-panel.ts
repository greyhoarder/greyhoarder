import {
  afterNextRender,
  Component,
  ElementRef,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { HlmButton } from '@spartan-ng/helm/button';
import { CountStepper } from '../count-stepper/count-stepper';

/** Tells the panels apart for their labels. */
let nextId = 0;

/** Deletes minis for good, for a row after asking how many (docs/screens/mini.md, Deleting). */
@Component({
  selector: 'app-delete-panel',
  imports: [HlmButton, CountStepper],
  templateUrl: './delete-panel.html',
  host: {
    class: 'flex flex-col gap-4 rounded-xl border bg-card p-4',
    role: 'region',
    '[attr.aria-labelledby]': 'headingId',
    'data-testid': 'mini-delete-panel',
  },
})
export class DeletePanel {
  /** How many minis the row has; the stepper shows only for more than one. */
  readonly rowSize = input(1);
  readonly isDeleting = input(false);
  /** How many minis of the row to delete. */
  readonly deleted = output<number>();
  /** Cancelled. */
  readonly closed = output();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly headingId = `delete-panel-${nextId++}-heading`;
  protected readonly count = signal(1);

  constructor() {
    afterNextRender(() =>
      this.host.nativeElement
        .querySelector<HTMLElement>('[data-testid="mini-delete-cancel"]')
        ?.focus(),
    );
  }

  protected changeCount(by: number): void {
    this.count.update((count) => Math.min(this.rowSize(), Math.max(1, count + by)));
  }
}
