import { Component, inject, input } from '@angular/core';
import { hobbyStatuses } from '@greyhoarder/domain/hoard';
import { HlmButton } from '@spartan-ng/helm/button';
import { MinisAddition } from '../../../application/minis/minis-addition';
import { MinisStepper } from '../../../ui/minis-stepper/minis-stepper';
import { PartTiles } from '../../../ui/part-tiles/part-tiles';
import { StatusChoice } from '../../../ui/status-choice/status-choice';

/**
 * What to add of a catalog mini: its status, its parts and how many. Its name and faction come
 * from the catalog; the form keeps what was chosen after adding.
 */
@Component({
  selector: 'app-add-minis-form',
  imports: [HlmButton, MinisStepper, PartTiles, StatusChoice],
  template: `
    <app-status-choice
      testId="add-minis-status"
      [statuses]="statuses"
      [chosen]="addition.status()"
      (chose)="addition.status.set($event)"
    />
    <app-part-tiles
      [parts]="addition.parts()"
      [isPickerOpen]="addition.isPickerOpen()"
      [source]="addition.partSource()"
      [boxName]="kits()"
      [rangeName]="addition.rangeName()"
      (removed)="addition.removePart($event)"
      (swappableToggled)="addition.toggleSwappable($event)"
      (added)="addition.addPart($event)"
      (pickerToggled)="addition.togglePicker()"
    />
    <div class="flex flex-wrap items-center gap-3 border-t pt-4">
      <app-minis-stepper
        testId="add-minis"
        [count]="addition.count()"
        (changed)="addition.changeCount($event)"
      />
      <button
        hlmBtn
        type="button"
        class="ml-auto h-10 text-sm font-semibold"
        data-testid="add-minis-submit"
        [disabled]="addition.isAdding()"
        (click)="addition.add()"
      >
        {{ addition.addLabel() }}
      </button>
    </div>
  `,
  host: { class: 'flex flex-col gap-4 px-3 pb-4 sm:px-5' },
})
export class AddMinisForm {
  protected readonly addition = inject(MinisAddition);

  /** The kits the mini comes from, for "From the kit · {kits}" in the part picker. */
  readonly kits = input.required<string>();

  protected readonly statuses = hobbyStatuses;
}
