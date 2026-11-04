import { Component, ElementRef, input, output, viewChildren } from '@angular/core';
import type { HobbyStatus } from '@greyhoarder/domain/hoard';
import { STATUS_LABELS } from '../../util/status-labels';

/** Tells the groups apart for their labels. */
let nextId = 0;

/**
 * "Status" and a segmented control of the offered statuses, one of them chosen, or none while minis
 * don't share one; arrow keys move the choice.
 */
@Component({
  selector: 'app-status-choice',
  template: `
    @if (!isLabelHidden()) {
      <span class="text-sm font-medium tracking-wide text-muted-foreground" [id]="labelId">Status</span>
    }
    <div
      class="flex overflow-hidden rounded-lg border bg-card"
      [class.w-fit]="!isFullWidth()"
      role="radiogroup"
      [attr.aria-labelledby]="isLabelHidden() ? null : labelId"
      [attr.aria-label]="isLabelHidden() ? 'Status' : null"
    >
      @for (status of statuses(); track status) {
        <button
          #chip
          type="button"
          role="radio"
          [class.flex-1]="isFullWidth()"
          class="h-8 px-3 text-sm text-muted-foreground transition-colors not-first:border-l focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-inset aria-checked:bg-muted aria-checked:font-medium aria-checked:text-foreground"
          [attr.data-testid]="testId()"
          [attr.data-status]="status"
          [attr.aria-checked]="status === chosen()"
          [tabIndex]="status === chosen() || (chosen() === undefined && $first) ? 0 : -1"
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
  /** None while nothing is chosen; the first chip then takes the focus. */
  readonly chosen = input.required<HobbyStatus | undefined>();
  /** Of each chip, which also carries its status as `data-status`. */
  readonly testId = input.required<string>();
  /** For a page with a heading of its own; the group is still named "Status". */
  readonly isLabelHidden = input(false);
  /** The segments share the full width, e.g. in a side column. */
  readonly isFullWidth = input(false);
  readonly chose = output<HobbyStatus>();

  protected readonly labelId = `status-choice-${nextId++}`;
  protected readonly labels = STATUS_LABELS;

  /** One per offered status, in the same order. */
  private readonly chips = viewChildren<ElementRef<HTMLButtonElement>>('chip');

  /** Chooses the next or previous status, wrapping around, and moves the focus to it. */
  protected move(event: Event, by: 1 | -1): void {
    event.preventDefault();
    const statuses = this.statuses();
    const chosen = this.chosen();
    // Without a choice, the first or last status comes next.
    const at = chosen === undefined ? (by > 0 ? -1 : statuses.length) : statuses.indexOf(chosen);
    const index = (at + by + statuses.length) % statuses.length;
    const next = statuses[index];

    if (next === undefined) {
      return;
    }

    this.chose.emit(next);
    this.chips()[index]?.nativeElement.focus();
  }
}
