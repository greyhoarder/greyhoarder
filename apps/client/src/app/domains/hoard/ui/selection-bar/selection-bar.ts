import { Component, input, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideEllipsisVertical, lucideX } from '@ng-icons/lucide';
import { provideBrnPopoverDefaultOptions } from '@spartan-ng/brain/popover';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmPopoverImports } from '@spartan-ng/helm/popover';

/**
 * The bar of selection mode, in place of the filters and sticking to the top: how many minis are
 * selected, the actions on them, and "Reset"; on narrow screens some go into its "⋮"
 * menu (docs/screens/hoard.md, Layout).
 */
@Component({
  selector: 'app-selection-bar',
  imports: [NgIcon, HlmButton, HlmPopoverImports],
  providers: [
    provideIcons({ lucideEllipsisVertical, lucideX }),
    // The menu is a menu, not a dialog; its list carries the role.
    provideBrnPopoverDefaultOptions({ role: undefined }),
  ],
  templateUrl: './selection-bar.html',
  host: {
    class: 'sticky top-0 z-10 block bg-background @container',
    '[attr.data-testid]': 'screen() + "-selection-bar"',
  },
})
export class SelectionBar {
  /** The screen the bar is on, which starts its test IDs. */
  readonly screen = input.required<'hoard' | 'box'>();
  readonly count = input.required<number>();
  /** Some of the selected minis are not gone, so they can leave the hoard. */
  readonly canLeave = input.required<boolean>();
  readonly finished = output();
  readonly editChosen = output();
  readonly leaveChosen = output();
  readonly deleteChosen = output();

  protected readonly menuItems = [
    { label: 'Leave the hoard…', action: 'leave', isDestructive: false },
    { label: 'Delete', action: 'delete', isDestructive: true },
  ] as const;

  protected isDisabled(action: 'leave' | 'delete'): boolean {
    return action === 'leave' ? !this.canLeave() : action === 'delete' && this.count() === 0;
  }

  protected choose(action: 'leave' | 'delete'): void {
    ({ leave: this.leaveChosen, delete: this.deleteChosen })[action].emit();
  }
}
