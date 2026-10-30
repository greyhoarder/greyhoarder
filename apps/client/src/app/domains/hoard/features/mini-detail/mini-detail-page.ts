import { Component, computed, effect, ElementRef, inject, input, signal, viewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { isGone } from '@greyhoarder/domain/hoard';
import { Router, RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideBrush, lucideCamera, lucideChevronLeft, lucideEllipsisVertical, lucideX } from '@ng-icons/lucide';
import { provideBrnPopoverDefaultOptions } from '@spartan-ng/brain/popover';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmPopoverImports } from '@spartan-ng/helm/popover';
import { HlmSkeleton } from '@spartan-ng/helm/skeleton';
import { FactionSearch } from '../../application/faction-search';
import { MiniEditor } from '../../application/minis/mini-editor';
import { AddFaction } from '../../ui/add-faction/add-faction';
import { BuildAs } from '../../ui/build-as/build-as';
import { BuildBar } from '../../ui/build-bar/build-bar';
import { DeletePanel } from '../../ui/delete-panel/delete-panel';
import { type Leaving, LeavePanel } from '../../ui/leave-panel/leave-panel';
import { PartTiles } from '../../ui/part-tiles/part-tiles';
import { StatusBadge } from '../../ui/status-badge/status-badge';
import { progressPercent } from '../../models/box-progress';
import { isOwnDraft } from '../../models/faction-draft';
import { PROGRESS_STATUSES, STATUS_COLORS } from '../../ui/progress-bar/progress-bar';
import { eitherOrText } from '../../util/either-or';
import { formatDate } from '../../util/format-date';
import { DEPARTURE_LABELS, STATUS_LABELS } from '../../util/status-labels';
import { MiniBoxCard } from './mini-box-card/mini-box-card';
import { EitherOrName } from '../../ui/either-or-name/either-or-name';

/**
 * One mini: building it while on the sprue, editing it afterwards, letting it leave the hoard or
 * deleting it. Shows what its `MiniEditor` holds. Specified in docs/screens/mini.md.
 */
@Component({
  selector: 'app-mini-detail-page',
  imports: [
    AddFaction,
    EitherOrName,
    RouterLink,
    NgIcon,
    HlmButton,
    HlmPopoverImports,
    HlmSkeleton,
    StatusBadge,
    BuildAs,
    PartTiles,
    BuildBar,
    MiniBoxCard,
    LeavePanel,
    DeletePanel,
  ],
  providers: [
    MiniEditor,
    FactionSearch,
    provideIcons({
      lucideBrush,
      lucideCamera,
      lucideChevronLeft,
      lucideEllipsisVertical,
      lucideX,
    }),
    // The mini menu is a menu, not a dialog; its list carries the role.
    provideBrnPopoverDefaultOptions({ role: undefined }),
  ],
  templateUrl: './mini-detail-page.html',
  host: { class: 'flex w-full flex-col gap-6 p-4 sm:p-8 lg:p-10' },
})
export class MiniDetailPage {
  /** From the route. */
  readonly id = input.required<string>();
  /** From the query: `box` when opened from the mini's box, which the back link then leads to. */
  readonly from = input<string>();

  protected readonly editor = inject(MiniEditor);
  protected readonly factionSearch = inject(FactionSearch);
  private readonly title = inject(Title);
  private readonly router = inject(Router);
  private readonly menuButton = viewChild('menuButton', { read: ElementRef<HTMLElement> });

  /** Back to the box the screen was opened from, else to the hoard. */
  protected readonly back = computed(() => {
    const boxId = this.editor.box()?.id;
    return this.from() === 'box' && boxId !== undefined
      ? { link: ['/hoard/boxes', boxId], label: 'Box' }
      : { link: ['/hoard/minis'], label: 'Hoard' };
  });

  protected readonly factions = computed(() =>
    this.editor.factions().map((faction) => ({ name: faction.name, isOwn: isOwnDraft(faction) })),
  );

  /** Gives the faction to the minis and closes the search. */
  protected chooseFaction(faction: { readonly id: string; readonly name: string }): void {
    this.editor.addFaction(faction);
    this.factionSearch.close();
  }

  /** Gives the minis a new own faction of that name and closes the search. */
  protected createFaction(name: string): void {
    this.editor.createFaction(name);
    this.factionSearch.close();
  }
  /** How far the mini is, 0 to 100, weighted like a box's progress. */
  protected readonly percent = computed(() => progressPercent([this.editor.status()]));
  /** One segment per status past the sprue; those reached take the color of the current status. */
  protected readonly statusSegments = computed(() => {
    const status = this.editor.status();
    const current = PROGRESS_STATUSES.indexOf(status);
    return PROGRESS_STATUSES.map((segment, index) => ({
      status: segment,
      label: STATUS_LABELS[segment],
      color: index <= current ? STATUS_COLORS[status] : 'bg-muted',
    }));
  });
  /** How far the minis' box is, 0 to 100; none without a box or when all of its minis are gone. */
  protected readonly boxPercent = computed(() => {
    const minis = this.editor.minisOfBox().filter((mini) => !isGone(mini));
    return minis.length > 0 ? progressPercent(minis.map((mini) => mini.status)) : 0;
  });

  protected readonly partsHint = computed(() =>
    this.editor.isOnSprue() && !this.editor.partsChanged() && this.editor.parts().length > 0
      ? `Preselected for ${this.editor.buildName()} — change what you actually built`
      : 'What is physically on this mini',
  );

  protected readonly isPickerOpen = signal(false);
  protected readonly isLeaving = signal(false);
  protected readonly isDeleting = signal(false);
  /** The leave or the delete panel; at most one is open. */
  protected readonly openPanel = signal<'leave' | 'delete' | undefined>(undefined);

  /** Gone minis can't leave again. */
  protected readonly menuItems = computed(() => [
    {
      label: 'Change origin box…',
      testId: 'mini-change-origin',
      panel: undefined,
      isDestructive: false,
    },
    ...(this.editor.isGone()
      ? []
      : [
          {
            label: 'Leave the hoard…',
            testId: 'mini-leave',
            panel: 'leave' as const,
            isDestructive: false,
          },
        ]),
    { label: 'Delete mini…', testId: 'mini-delete', panel: 'delete' as const, isDestructive: true },
  ]);

  /** E.g. "Sold on 12 Oct 2026". */
  protected readonly departureText = computed(() => {
    const departure = this.editor.mini()?.departure;
    return departure && `${DEPARTURE_LABELS[departure.reason]} on ${formatDate(departure.on)}`;
  });
  protected readonly formatDate = formatDate;

  constructor() {
    effect(() => this.editor.miniId.set(this.id()));
    effect(() => {
      const name = this.editor.name();
      if (this.editor.mini()) {
        this.title.setTitle(`${eitherOrText(name)} · Greyhoarder`);
      }
    });
  }

  protected openMenuPanel(panel: 'leave' | 'delete' | undefined): void {
    if (panel !== undefined) {
      this.isPickerOpen.set(false);
      this.openPanel.set(panel);
    }
  }

  /** Back to the menu button. */
  protected closePanel(): void {
    this.openPanel.set(undefined);
    this.menuButton()?.nativeElement.focus();
  }

  protected async leave({ departure }: Leaving): Promise<void> {
    this.isLeaving.set(true);
    const hasLeft = await this.editor.leave(departure, 1);
    this.isLeaving.set(false);
    if (hasLeft) {
      this.closePanel();
    }
  }

  /** Afterwards its box, which asks whether to delete it once empty, or the hoard without a box. */
  protected async delete(): Promise<void> {
    const boxId = this.editor.box()?.id;
    this.isDeleting.set(true);
    const { isDeleted, emptiedBoxIds } = await this.editor.delete(1);
    this.isDeleting.set(false);
    if (isDeleted) {
      this.openPanel.set(undefined);
      void this.router.navigate(boxId === undefined ? ['/hoard/minis'] : ['/hoard/boxes', boxId], {
        replaceUrl: true,
        state: { isEmptied: boxId !== undefined && emptiedBoxIds.includes(boxId) },
      });
    }
  }

  protected togglePicker(): void {
    if (!this.isPickerOpen()) {
      this.openPanel.set(undefined);
    }
    this.isPickerOpen.update((isOpen) => !isOpen);
  }

  protected typeNotes(event: Event): void {
    if (event.target instanceof HTMLTextAreaElement) {
      this.editor.notes.set(event.target.value);
    }
  }

  /** Arrow keys, Home and End move between the items of the mini menu. */
  protected moveFocus(event: KeyboardEvent): void {
    const menu = event.target instanceof HTMLElement ? event.target.closest('[role="menu"]') : null;
    if (!menu) {
      return;
    }
    const items = [...menu.querySelectorAll<HTMLElement>('[role="menuitem"]')];
    const current = items.findIndex((item) => item === document.activeElement);
    const next = {
      ArrowDown: (current + 1) % items.length,
      ArrowUp: (current - 1 + items.length) % items.length,
      Home: 0,
      End: items.length - 1,
    }[event.key];
    if (next !== undefined) {
      event.preventDefault();
      items[next]?.focus();
    }
  }
}
