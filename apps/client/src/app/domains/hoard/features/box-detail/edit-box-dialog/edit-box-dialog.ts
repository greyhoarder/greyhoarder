import { Component, computed, input, linkedSignal, output } from '@angular/core';
import { type Box, editedRows, type Kit, type Mini, sprueMinis, sprueRowCounts } from '@greyhoarder/domain/hoard';
import { HlmAlertDialogImports } from '@spartan-ng/helm/alert-dialog';
import { eitherOrText } from '../../../util/either-or';
import { SprueRow } from '../../../ui/sprue-row/sprue-row';

/**
 * Counts the minis on the sprue of a box from a kit anew, row by row of its kit; nothing is saved
 * here, the counted rows are handed over (docs/screens/box.md, Edit dialog).
 */
@Component({
  selector: 'app-edit-box-dialog',
  imports: [HlmAlertDialogImports, SprueRow],
  templateUrl: './edit-box-dialog.html',
})
export class EditBoxDialog {
  readonly isOpen = input.required<boolean>();
  readonly box = input.required<Box>();
  /** In the version the box records. */
  readonly kit = input.required<Kit>();
  /** The box's minis. */
  readonly minis = input.required<readonly Mini[]>();
  readonly isSaving = input(false);
  readonly hasFailed = input(false);
  /** The minis on the sprue per row of the kit, when they changed. */
  readonly saved = output<readonly number[]>();
  /** Cancelled, saved without a change, or closed once saved. */
  readonly closed = output();

  protected readonly title = computed(() => `Edit ${eitherOrText(this.box().name)}`);
  protected readonly sprueRows = computed(() => sprueMinis(this.kit()));
  /** What the box has on the sprue per row, where each opening starts. */
  private readonly startRows = computed(() => sprueRowCounts(this.kit(), this.minis()));
  /** Counted by the user; kept when saving fails, started anew each time the dialog opens. */
  protected readonly rows = linkedSignal({
    source: () => ({ isOpen: this.isOpen(), start: this.startRows() }),
    computation: ({ start }) => start,
  });
  /** What saving the counted rows would do; the ids of the minis it would add are never used. */
  private readonly edit = computed(() => editedRows(this.kit(), this.box(), this.minis(), this.rows(), () => ''));
  protected readonly deleteCount = computed(() => this.edit().deletedIds.length);
  private readonly isChanged = computed(() => this.edit().added.length > 0 || this.deleteCount() > 0);

  protected changeRow(row: number, by: 1 | -1): void {
    this.rows.update((rows) => rows.map((count, index) => (index === row ? Math.max(0, count + by) : count)));
  }

  /** Hands over changed rows; unchanged ones only close the dialog. */
  protected save(dialog: { close: () => void }): void {
    if (this.isChanged()) {
      this.saved.emit(this.rows());
    } else {
      dialog.close();
    }
  }
}
