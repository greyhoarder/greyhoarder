import { Component, computed, input, output, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideTrash2, lucideX } from '@ng-icons/lucide';
import { HlmAlertDialogImports } from '@spartan-ng/helm/alert-dialog';

/**
 * Asks before a box is deleted for good, with all its minis or keeping those past the sprue
 * without a box (docs/screens/box.md, Behavior).
 */
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
  /** How many of its minis are past the sprue, gone ones included: those that can stay. */
  readonly builtMiniCount = input.required<number>();
  /** How many of its minis are on the sprue: those that always go with it. */
  readonly sprueMiniCount = input.required<number>();
  readonly isDeleting = input(false);
  readonly hasFailed = input(false);
  /** Delete with all its minis. */
  readonly confirmed = output();
  /** Delete, keeping its minis past the sprue without a box. */
  readonly keptBuiltMinis = output();
  /** Cancelled, or closed once the box is deleted. */
  readonly closed = output();

  /** The button that was pressed shows the busy stripes. */
  protected readonly chosen = signal<'keep' | 'delete'>('delete');
  protected readonly canKeep = computed(() => this.builtMiniCount() > 0);

  protected readonly text = computed(() => {
    const built = this.builtMiniCount();
    const sprue = this.sprueMiniCount();
    const builtText =
      built === 0
        ? ''
        : built === 1
          ? 'Its built mini can stay in your hoard without a box, or be deleted with it. '
          : `Its ${built} built minis can stay in your hoard without a box, or be deleted with it, gone ones included. `;
    const sprueText =
      sprue === 0
        ? ''
        : sprue === 1
          ? 'Its mini on the sprue is deleted with it. '
          : `Its ${sprue} minis on the sprue are deleted with it. `;
    return `${builtText}${sprueText}This can't be undone.`;
  });

  protected keep(): void {
    this.chosen.set('keep');
    this.keptBuiltMinis.emit();
  }

  protected delete(): void {
    this.chosen.set('delete');
    this.confirmed.emit();
  }
}
