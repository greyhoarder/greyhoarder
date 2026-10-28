import { Component, input, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideBox, lucideX } from '@ng-icons/lucide';
import { HlmAlertDialogImports } from '@spartan-ng/helm/alert-dialog';

/** Asks before selected minis are deleted for good, naming them (docs/screens/hoard.md, Behavior). */
@Component({
  selector: 'app-delete-minis-dialog',
  imports: [HlmAlertDialogImports, NgIcon],
  providers: [provideIcons({ lucideBox, lucideX })],
  templateUrl: './delete-minis-dialog.html',
})
export class DeleteMinisDialog {
  /** The screen the dialog is on, which starts its test IDs. */
  readonly screen = input.required<'hoard' | 'box'>();
  readonly isOpen = input.required<boolean>();
  readonly count = input.required<number>();
  /** The minis' names with their counts, e.g. "Boy ×2, Nob". */
  readonly names = input.required<string>();
  readonly isDeleting = input(false);
  readonly hasFailed = input(false);
  readonly confirmed = output();
  /** Cancelled, or closed once the minis are deleted. */
  readonly closed = output();
}
