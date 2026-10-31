import { Component, DestroyRef, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronDown, lucideList, lucidePlus, lucideRows2 } from '@ng-icons/lucide';
import { provideBrnPopoverDefaultOptions } from '@spartan-ng/brain/popover';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmPopoverImports } from '@spartan-ng/helm/popover';
import { HlmSkeleton } from '@spartan-ng/helm/skeleton';
import { BoxesList } from '../../application/boxes/boxes-list';
import { HoardView } from '../../application/hoard-view';
import { changedText, MinisChangedNotice } from '../../application/minis/minis-changed-notice';
import { MinisList } from '../../application/minis/minis-list';
import { AddedBar } from '../../ui/added-bar/added-bar';
import { MenuKeys } from '../../../../shared/ui/menu-keys/menu-keys';

/** The other ways into the hoard, in the "Add…" menu. */
const ADD_ITEMS = [
  { label: 'Add sprues', link: '/hoard/add/sprues', testId: 'hoard-add-sprues' },
  { label: 'Add minis', link: '/hoard/add/minis', testId: 'hoard-add-minis' },
  { label: 'Add custom', link: '/hoard/add/custom', testId: 'hoard-add-custom' },
] as const;

/**
 * The frame of the hoard: summary, "Add boxes" and the menu of the other ways into it, the tabs
 * Minis and Boxes as links to their pages and the view switch, and how many minis were just changed.
 * Specified in docs/screens/hoard.md.
 */
@Component({
  selector: 'app-hoard-layout',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    NgIcon,
    HlmBadge,
    HlmButton,
    HlmPopoverImports,
    HlmSkeleton,
    MenuKeys,
    AddedBar,
  ],
  providers: [
    provideIcons({ lucideChevronDown, lucideList, lucidePlus, lucideRows2 }),
    // The add menu is a menu, not a dialog; its list carries the role.
    provideBrnPopoverDefaultOptions({ role: undefined }),
  ],
  templateUrl: './hoard-layout.html',
  host: { class: 'flex w-full flex-col gap-6 p-4 sm:p-8 lg:p-10' },
})
export class HoardLayout {
  protected readonly minis = inject(MinisList);
  protected readonly boxes = inject(BoxesList);
  protected readonly view = inject(HoardView);

  protected readonly changedNotice = inject(MinisChangedNotice);

  protected readonly addItems = ADD_ITEMS;
  protected readonly changedText = changedText;

  constructor() {
    // Told once on coming back to the hoard; leaving it ends that.
    inject(DestroyRef).onDestroy(() => this.changedNotice.dismiss());
  }
}
