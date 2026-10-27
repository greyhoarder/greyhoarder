import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideList, lucidePlus, lucideRows2 } from '@ng-icons/lucide';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmSkeleton } from '@spartan-ng/helm/skeleton';
import { BoxesList } from '../../application/boxes/boxes-list';
import { HoardView } from '../../application/hoard-view';
import { MinisList } from '../../application/minis/minis-list';

/**
 * The frame of the hoard: summary, add buttons, the tabs Minis and Boxes as
 * links to their pages and the view switch.
 * Specified in docs/screens/hoard.md.
 */
@Component({
  selector: 'app-hoard-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgIcon, HlmBadge, HlmButton, HlmSkeleton],
  providers: [provideIcons({ lucideList, lucidePlus, lucideRows2 })],
  templateUrl: './hoard-layout.html',
  host: { class: 'flex w-full flex-col gap-6 p-4 sm:p-8 lg:p-10' },
})
export class HoardLayout {
  protected readonly minis = inject(MinisList);
  protected readonly boxes = inject(BoxesList);
  protected readonly view = inject(HoardView);
}
