import { Component, computed, input, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideTrash2, lucideX } from '@ng-icons/lucide';
import { HlmAlertDialogImports } from '@spartan-ng/helm/alert-dialog';

/**
 * Asks once, after minis were deleted, whether the boxes they left without any minis are to be
 * deleted as well (docs/screens/hoard.md, Behavior).
 */
@Component({
  selector: 'app-empty-boxes-dialog',
  imports: [HlmAlertDialogImports, NgIcon],
  providers: [provideIcons({ lucideTrash2, lucideX })],
  templateUrl: './empty-boxes-dialog.html',
})
export class EmptyBoxesDialog {
  /** The screen the dialog is on, which starts its test IDs. */
  readonly screen = input.required<'hoard' | 'box'>();
  readonly isOpen = input.required<boolean>();
  /** The names of the empty boxes. */
  readonly names = input.required<readonly string[]>();
  readonly isDeleting = input(false);
  readonly hasFailed = input(false);
  readonly confirmed = output();
  /** Kept, or closed once the boxes are deleted. */
  readonly closed = output();

  protected readonly question = computed(() => {
    const names = this.names();
    return names.length === 1
      ? `${names[0]} has no minis left. Delete the box as well?`
      : `${names.length} boxes have no minis left: ${names.join(', ')}. Delete them as well?`;
  });
  protected readonly isOne = computed(() => this.names().length === 1);
}
