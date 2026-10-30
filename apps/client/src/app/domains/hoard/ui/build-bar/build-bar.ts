import { Component, computed, input, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideHammer } from '@ng-icons/lucide';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmCheckbox } from '@spartan-ng/helm/checkbox';
import { CountStepper } from '../count-stepper/count-stepper';
import type { PartTile } from '../part-tiles/part-tiles';

/** Tells the bars' checkboxes apart. */
let nextId = 0;

/**
 * What building minis on the sprue makes of them, how many of their row to build, whether they go
 * on the workbench, and the build button (docs/screens/mini.md, docs/screens/box.md).
 */
@Component({
  selector: 'app-build-bar',
  imports: [NgIcon, HlmButton, HlmCheckbox, CountStepper],
  providers: [provideIcons({ lucideHammer })],
  templateUrl: './build-bar.html',
  host: {
    class: 'flex flex-wrap items-center justify-between gap-4',
    'data-testid': 'mini-build-bar',
  },
})
export class BuildBar {
  /** What the minis are built as; empty until chosen. */
  readonly name = input.required<string>();
  readonly parts = input.required<readonly PartTile[]>();
  readonly count = input(1);
  /** How many minis the row has; the stepper shows only for more than one. */
  readonly rowSize = input(1);
  readonly isOnWorkbench = input.required<boolean>();
  readonly isBuilding = input(false);
  readonly countChanged = output<1 | -1>();
  readonly workbenchChange = output<boolean>();
  readonly built = output();

  protected readonly workbenchId = `build-bar-${nextId++}-workbench`;

  protected readonly summary = computed(() => {
    const name = this.name();
    if (name === '') {
      return 'Choose what to build.';
    }
    const parts = this.parts().map((part) => (part.isSwappable ? `${part.name} (swappable)` : part.name));
    const what = parts.length > 0 ? `${name} with ${parts.join(', ')}.` : `${name}, no parts.`;
    const [count, size] = [this.count(), this.rowSize()];
    if (size === 1) {
      return `This mini becomes ${what}`;
    }
    return `${count} of ${size} alike minis ${count === 1 ? 'becomes' : 'become'} ${what}`;
  });
}
