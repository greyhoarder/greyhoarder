import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideBrush,
  lucideCamera,
  lucideChevronLeft,
  lucideEllipsisVertical,
  lucideHammer,
  lucideDroplet,
  lucideMagnet,
  lucideMinus,
  lucidePlus,
  lucideX,
} from '@ng-icons/lucide';
import { provideBrnPopoverDefaultOptions } from '@spartan-ng/brain/popover';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmCheckbox } from '@spartan-ng/helm/checkbox';
import { HlmPopoverImports } from '@spartan-ng/helm/popover';
import { HlmSkeleton } from '@spartan-ng/helm/skeleton';
import { FactionNamesStore } from '../../data/faction-names-store';
import { StatusBadge } from '../../ui/status-badge/status-badge';
import { progressPercent } from '../../models/box-progress';
import { PROGRESS_STATUSES, STATUS_COLORS } from '../../ui/progress-bar/progress-bar';
import { eitherOrText } from '../../util/either-or';
import { STATUS_LABELS } from '../../util/status-labels';
import { MiniBoxCard } from './mini-box-card/mini-box-card';
import { MiniEditor } from './mini-editor';
import { PartPicker } from './part-picker/part-picker';
import { EitherOrName } from '../../ui/either-or-name/either-or-name';

/**
 * One mini, or one row of alike minis: building it while on the sprue, editing it afterwards.
 * Shows what its `MiniEditor` holds. Specified in docs/screens/mini.md.
 */
@Component({
  selector: 'app-mini-detail-page',
  imports: [
    EitherOrName,
    RouterLink,
    NgIcon,
    HlmButton,
    HlmCheckbox,
    HlmPopoverImports,
    HlmSkeleton,
    StatusBadge,
    PartPicker,
    MiniBoxCard,
  ],
  providers: [
    MiniEditor,
    provideIcons({
      lucideBrush,
      lucideCamera,
      lucideChevronLeft,
      lucideEllipsisVertical,
      lucideHammer,
      lucideDroplet,
      lucideMagnet,
      lucideMinus,
      lucidePlus,
      lucideX,
    }),
    // The mini menu is a menu, not a dialog; its list carries the role.
    provideBrnPopoverDefaultOptions({ role: undefined }),
  ],
  templateUrl: './mini-detail-page.html',
  host: { class: 'flex w-full flex-col gap-6 p-4 sm:p-8 lg:p-10' },
})
export class MiniDetailPage {
  /** From the route: the first mini of the row. */
  readonly id = input.required<string>();

  protected readonly editor = inject(MiniEditor);
  private readonly factionNames = inject(FactionNamesStore);
  private readonly title = inject(Title);

  protected readonly factions = computed(() =>
    this.editor.factionIds().map((id) => ({ id, name: this.factionNames.names().get(id) ?? id })),
  );
  protected readonly boxName = computed(() => {
    const box = this.editor.box();
    return box && eitherOrText(box.name);
  });

  /** How far the minis are, 0 to 100, weighted like a box's progress. */
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
  /** How far the minis' box is, 0 to 100; none without a box. */
  protected readonly boxPercent = computed(() => {
    const minis = this.editor.minisOfBox();
    return minis.length > 0 ? progressPercent(minis.map((mini) => mini.status)) : 0;
  });

  protected readonly nameTiles = computed(() =>
    this.editor.suggestions().map(({ name, left }) => {
      const isChosen = this.editor.ownName().trim() === '' && name === this.editor.name();
      const isTooMany = isChosen && this.editor.isOnSprue() && this.editor.count() > left;
      return {
        name,
        isChosen,
        isWarning: left === 0 || isTooMany,
        hint:
          left === 0
            ? 'None left in this box'
            : isTooMany
              ? `Only ${left} left in this box`
              : `${left} left in this box`,
      };
    }),
  );

  protected readonly partsHint = computed(() =>
    this.editor.isOnSprue() && !this.editor.partsChanged() && this.editor.parts().length > 0
      ? `Preselected for ${this.editor.buildName()} — change what you actually built`
      : 'What is physically on this mini',
  );

  protected readonly summary = computed(() => {
    const name = this.editor.buildName();
    if (name === '') {
      return 'Choose what to build.';
    }
    const parts = this.editor
      .parts()
      .map((part) => (part.isSwappable ? `${part.name} (swappable)` : part.name));
    const what = parts.length > 0 ? `${name} with ${parts.join(', ')}.` : `${name}, no parts.`;
    const [count, size] = [this.editor.count(), this.editor.rowSize()];
    if (size === 1) {
      return `This mini becomes ${what}`;
    }
    return `${count} of ${size} alike minis ${count === 1 ? 'becomes' : 'become'} ${what}`;
  });

  protected readonly isPickerOpen = signal(false);

  protected readonly menuItems = [
    { label: 'Duplicate mini', testId: 'mini-duplicate', isDestructive: false },
    { label: 'Change origin box…', testId: 'mini-change-origin', isDestructive: false },
    { label: 'Delete mini…', testId: 'mini-delete', isDestructive: true },
  ] as const;

  constructor() {
    effect(() => this.editor.miniId.set(this.id()));
    effect(() => {
      const name = this.editor.name();
      if (this.editor.mini()) {
        this.title.setTitle(`${eitherOrText(name)} · Greyhoarder`);
      }
    });
  }

  protected togglePicker(): void {
    this.isPickerOpen.update((isOpen) => !isOpen);
  }

  protected typeOwnName(event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      this.editor.ownName.set(event.target.value);
    }
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
