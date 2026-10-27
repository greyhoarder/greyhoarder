import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCircleCheck, lucideList, lucidePlus, lucideRows2 } from '@ng-icons/lucide';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmSkeleton } from '@spartan-ng/helm/skeleton';
import { filter, map } from 'rxjs';
import { BoxesList } from '../../application/boxes/boxes-list';
import { HoardView } from '../../application/hoard-view';
import { MinisList } from '../../application/minis/minis-list';

/**
 * The frame of the hoard: summary, add buttons, the tabs Minis and Boxes as
 * links to their pages, "Select" for the open tab and the view switch.
 * Specified in docs/screens/hoard.md.
 */
@Component({
  selector: 'app-hoard-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgIcon, HlmBadge, HlmButton, HlmSkeleton],
  providers: [provideIcons({ lucideCircleCheck, lucideList, lucidePlus, lucideRows2 })],
  templateUrl: './hoard-layout.html',
  host: { class: 'flex w-full flex-col gap-6 p-4 sm:p-8 lg:p-10' },
})
export class HoardLayout {
  protected readonly minis = inject(MinisList);
  protected readonly boxes = inject(BoxesList);
  protected readonly view = inject(HoardView);
  private readonly router = inject(Router);

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => this.router.url),
    ),
    { initialValue: this.router.url },
  );

  /** The store of the open tab, which "Select" acts on. */
  private readonly openList = computed(() =>
    this.url().startsWith('/hoard/boxes') ? this.boxes : this.minis,
  );
  protected readonly isOpenListSelecting = computed(() => this.openList().isSelecting());

  protected startSelecting(): void {
    this.openList().startSelecting();
  }
}
