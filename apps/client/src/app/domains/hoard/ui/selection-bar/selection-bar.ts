import { Component, input, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideEllipsisVertical } from '@ng-icons/lucide';
import { provideBrnPopoverDefaultOptions } from '@spartan-ng/brain/popover';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmPopoverImports } from '@spartan-ng/helm/popover';

/**
 * The bar of selection mode, sticking to the top: how many minis are selected, the actions on
 * them, "Select all" and "Done"; on narrow screens some go into its "⋮" menu
 * (docs/screens/hoard.md, Layout).
 */
@Component({
  selector: 'app-selection-bar',
  imports: [NgIcon, HlmButton, HlmPopoverImports],
  providers: [
    provideIcons({ lucideEllipsisVertical }),
    // The menu is a menu, not a dialog; its list carries the role.
    provideBrnPopoverDefaultOptions({ role: undefined }),
  ],
  templateUrl: './selection-bar.html',
  host: {
    class: 'sticky top-0 z-10 block @container',
    '[attr.data-testid]': 'screen() + "-selection-bar"',
  },
})
export class SelectionBar {
  /** The screen the bar is on, which starts its test IDs. */
  readonly screen = input.required<'hoard' | 'box'>();
  readonly count = input.required<number>();
  /** Some of the selected minis are not gone, so they can leave the hoard. */
  readonly canLeave = input.required<boolean>();
  readonly allSelected = output();
  readonly finished = output();
  readonly editChosen = output();
  readonly leaveChosen = output();
  readonly deleteChosen = output();

  protected readonly menuItems = [
    { label: 'Select all', action: 'all', isDestructive: false },
    { label: 'Leave the hoard…', action: 'leave', isDestructive: false },
    { label: 'Delete…', action: 'delete', isDestructive: true },
  ] as const;

  protected isDisabled(action: 'all' | 'leave' | 'delete'): boolean {
    return action === 'leave' ? !this.canLeave() : action === 'delete' && this.count() === 0;
  }

  protected choose(action: 'all' | 'leave' | 'delete'): void {
    ({ all: this.allSelected, leave: this.leaveChosen, delete: this.deleteChosen })[action].emit();
  }
}
