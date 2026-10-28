import { Component, computed, input, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideTrash2, lucideX } from '@ng-icons/lucide';
import { HlmAlertDialogImports } from '@spartan-ng/helm/alert-dialog';

/** Asks before a box is deleted for good with all its minis (docs/screens/box.md, Behavior). */
@Component({
  selector: 'app-delete-box-dialog',
  imports: [HlmAlertDialogImports, NgIcon],
  providers: [provideIcons({ lucideTrash2, lucideX })],
  templateUrl: './delete-box-dialog.html',
})
export class DeleteBoxDialog {
  readonly isOpen = input.required<boolean>();
  /** The box's name as plain text. */
  readonly name = input.required<string>();
  /** How many minis go with it, gone ones included. */
  readonly miniCount = input.required<number>();
  readonly isDeleting = input(false);
  readonly hasFailed = input(false);
  readonly confirmed = output();
  /** Cancelled, or closed once the box is deleted. */
  readonly closed = output();

  protected readonly text = computed(() => {
    const count = this.miniCount();
    const minis =
      count === 0
        ? ''
        : count === 1
          ? 'Its mini is deleted with it. '
          : `Its ${count} minis are deleted with it, gone ones included. `;
    return `${minis}This can't be undone.`;
  });
}
