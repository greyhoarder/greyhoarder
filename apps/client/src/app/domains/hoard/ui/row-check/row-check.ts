import { Component, input, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCheck } from '@ng-icons/lucide';

/**
 * The round check that selects a row of minis. Hidden until the row is
 * hovered or the check has keyboard focus, unless `isVisible` is set (selection mode).
 * The row must carry the Tailwind class `group`.
 */
@Component({
  selector: 'app-row-check',
  imports: [NgIcon],
  providers: [provideIcons({ lucideCheck })],
  template: `
    <button
      type="button"
      role="checkbox"
      [attr.data-testid]="testId()"
      class="flex size-6 items-center justify-center rounded-full border-2 border-foreground/70 bg-card opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none aria-checked:border-primary aria-checked:bg-primary aria-checked:text-primary-foreground"
      [class.opacity-100]="isVisible()"
      [attr.aria-checked]="isSelected()"
      [attr.aria-label]="label()"
      (click)="toggle($event)"
    >
      @if (isSelected()) {
        <ng-icon name="lucideCheck" size="14" />
      }
    </button>
  `,
})
export class RowCheck {
  readonly label = input.required<string>();
  readonly isSelected = input(false);
  readonly isVisible = input(false);
  readonly testId = input('hoard-row-check');
  readonly selectedChange = output<boolean>();

  /** The row itself reacts to clicks in selection mode; the check must not toggle twice. */
  protected toggle(event: Event): void {
    event.stopPropagation();
    this.selectedChange.emit(!this.isSelected());
  }
}
