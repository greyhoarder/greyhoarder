import { Component, computed, input, output, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideTrash2, lucideX } from '@ng-icons/lucide';
import { HlmAlertDialogImports } from '@spartan-ng/helm/alert-dialog';

/**
 * Asks before boxes are deleted for good, with all their minis or keeping those past the sprue
 * without a box (docs/screens/box.md, docs/screens/hoard.md, Behavior).
 */
@Component({
  selector: 'app-delete-box-dialog',
  imports: [HlmAlertDialogImports, NgIcon],
  providers: [provideIcons({ lucideTrash2, lucideX })],
  templateUrl: './delete-box-dialog.html',
})
export class DeleteBoxDialog {
  readonly isOpen = input.required<boolean>();
  /** The boxes' names as plain text. */
  readonly names = input.required<readonly string[]>();
  /** How many of their minis are past the sprue, gone ones included: those that can stay. */
  readonly builtMiniCount = input.required<number>();
  /** How many of their minis are on the sprue: those that always go with them. */
  readonly sprueMiniCount = input.required<number>();
  readonly isDeleting = input(false);
  readonly hasFailed = input(false);
  /** Delete with all their minis. */
  readonly confirmed = output();
  /** Delete, keeping their minis past the sprue without a box. */
  readonly keptBuiltMinis = output();
  /** Cancelled, or closed once the boxes are deleted. */
  readonly closed = output();

  /** The button that was pressed shows the busy stripes. */
  protected readonly chosen = signal<'keep' | 'delete'>('delete');
  protected readonly canKeep = computed(() => this.builtMiniCount() > 0);

  private readonly isOne = computed(() => this.names().length === 1);

  protected readonly title = computed(() => {
    const [first] = this.names();
    return `Delete ${this.isOne() ? first : `${this.names().length} boxes`} for good?`;
  });

  protected readonly deleteLabel = computed(() => {
    if (this.canKeep()) {
      return 'Delete with minis';
    }
    return this.isOne() ? 'Delete box' : 'Delete boxes';
  });

  protected readonly text = computed(() => {
    const [its, it] = this.isOne() ? ['Its', 'it'] : ['Their', 'them'];
    const built = this.builtMiniCount();
    const sprue = this.sprueMiniCount();
    const builtText =
      built === 0
        ? ''
        : built === 1
          ? `${its} built mini can stay in your hoard without a box, or be deleted with ${it}. `
          : `${its} ${built} built minis can stay in your hoard without a box, or be deleted with ${it}, gone ones included. `;
    const sprueText =
      sprue === 0
        ? ''
        : sprue === 1
          ? `${its} mini on the sprue is deleted with ${it}. `
          : `${its} ${sprue} minis on the sprue are deleted with ${it}. `;
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
