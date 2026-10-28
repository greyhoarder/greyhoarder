import { Component, ElementRef, input, output, viewChildren } from '@angular/core';
import type { HobbyStatus } from '@greyhoarder/domain/hoard';
import { STATUS_LABELS } from '../../util/status-labels';

/** Tells the groups apart for their labels. */
let nextId = 0;

/** "Status" and one toggle chip per offered status, exactly one of them chosen; arrow keys move the choice. */
@Component({
  selector: 'app-status-choice',
  template: `
    <span class="text-sm font-semibold" [id]="labelId">Status</span>
    <div class="flex flex-wrap gap-2" role="radiogroup" [attr.aria-labelledby]="labelId">
      @for (status of statuses(); track status) {
        <button
          #chip
          type="button"
          role="radio"
          class="inline-flex h-8 items-center rounded-full border px-3 text-sm transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none aria-checked:border-primary aria-checked:bg-primary/10"
          [attr.data-testid]="testId()"
          [attr.data-status]="status"
          [attr.aria-checked]="status === chosen()"
          [tabIndex]="status === chosen() ? 0 : -1"
          (click)="chose.emit(status)"
          (keydown.arrowRight)="move($event, 1)"
          (keydown.arrowDown)="move($event, 1)"
          (keydown.arrowLeft)="move($event, -1)"
          (keydown.arrowUp)="move($event, -1)"
        >
          {{ labels[status] }}
        </button>
      }
    </div>
  `,
  host: { class: 'flex flex-col gap-2' },
})
export class StatusChoice {
  /** In pipeline order. */
  readonly statuses = input.required<readonly HobbyStatus[]>();
  readonly chosen = input.required<HobbyStatus>();
  /** Of each chip, which also carries its status as `data-status`. */
  readonly testId = input.required<string>();
  readonly chose = output<HobbyStatus>();

  protected readonly labelId = `status-choice-${nextId++}`;
  protected readonly labels = STATUS_LABELS;

  /** One per offered status, in the same order. */
  private readonly chips = viewChildren<ElementRef<HTMLButtonElement>>('chip');

  /** Chooses the next or previous status, wrapping around, and moves the focus to it. */
  protected move(event: Event, by: 1 | -1): void {
    event.preventDefault();
    const statuses = this.statuses();
    const index = (statuses.indexOf(this.chosen()) + by + statuses.length) % statuses.length;
    const next = statuses[index];
    if (next === undefined) {
      return;
    }
    this.chose.emit(next);
    this.chips()[index]?.nativeElement.focus();
  }
}
