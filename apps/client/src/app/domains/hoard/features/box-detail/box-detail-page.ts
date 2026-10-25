import { Component, computed, effect, inject, input, resource } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, RouterLink } from '@angular/router';
import { hobbyStatuses, type Kit, toKit } from '@greyhoarder/domain/hoard';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideBox,
  lucideChevronLeft,
  lucideChevronRight,
  lucideEllipsisVertical,
} from '@ng-icons/lucide';
import { provideBrnPopoverDefaultOptions } from '@spartan-ng/brain/popover';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmPopoverImports } from '@spartan-ng/helm/popover';
import { HlmSkeleton } from '@spartan-ng/helm/skeleton';
import { HttpKitsAdapter } from '../../../catalog/api';
import { BoxesStore } from '../../data/boxes-store';
import { percentOf, progressOf, toBoxRows } from '../../data/box-row';
import { FactionNamesStore } from '../../data/faction-names-store';
import { countMinis, toMiniRows } from '../../data/mini-row';
import { sortRows } from '../../data/mini-sort';
import { MinisList } from '../../data/minis-list';
import { MinisStore } from '../../data/minis-store';
import { PartsStore } from '../../data/parts-store';
import { ProgressBadge } from '../../ui/progress-badge/progress-badge';
import { ProgressBar, STATUS_COLORS } from '../../ui/progress-bar/progress-bar';
import { kitLine } from '../../util/box-labels';
import { eitherOrText } from '../../util/either-or';
import { formatDate } from '../../util/format-date';
import { STATUS_LABELS } from '../../util/status-labels';
import { BoxKitCard } from './box-kit-card/box-kit-card';
import { BoxMiniCard } from './box-mini-card/box-mini-card';
import { EitherOrName } from '../../ui/either-or-name/either-or-name';

/** Everything about one box of the hoard; specified in docs/screens/box.md. */
@Component({
  selector: 'app-box-detail-page',
  imports: [
    EitherOrName,
    RouterLink,
    NgIcon,
    HlmBadge,
    HlmButton,
    HlmSkeleton,
    HlmPopoverImports,
    ProgressBadge,
    ProgressBar,
    BoxKitCard,
    BoxMiniCard,
  ],
  providers: [
    provideIcons({ lucideBox, lucideChevronLeft, lucideChevronRight, lucideEllipsisVertical }),
    // The box menu is a menu, not a dialog; its list carries the role.
    provideBrnPopoverDefaultOptions({ role: undefined }),
  ],
  templateUrl: './box-detail-page.html',
  host: { class: 'flex w-full flex-col gap-6 p-4 sm:p-8 lg:p-10' },
})
export class BoxDetailPage {
  /** From the route. */
  readonly id = input.required<string>();

  private readonly boxes = inject(BoxesStore);
  private readonly minis = inject(MinisStore);
  private readonly factionNames = inject(FactionNamesStore);
  private readonly minisList = inject(MinisList);
  private readonly parts = inject(PartsStore);
  private readonly title = inject(Title);
  private readonly router = inject(Router);
  private readonly catalogKits = inject(HttpKitsAdapter);

  protected readonly isLoading = computed(() => this.boxes.isLoading() || this.minis.isLoading());
  protected readonly hasFailed = computed(() => this.boxes.hasFailed() || this.minis.hasFailed());

  private readonly storedBox = computed(() =>
    this.boxes.boxes().find((box) => box.id === this.id()),
  );
  /** Undefined while loading and for a box that isn't in the hoard. */
  protected readonly box = computed(() => {
    const box = this.storedBox();
    return box && toBoxRows([box], this.minis.minis(), this.factionNames.names())[0];
  });
  /** Alike minis as one row, from the furthest status back to the sprue, then by name. */
  protected readonly miniRows = computed(() => {
    const box = this.storedBox();
    if (!box) {
      return [];
    }
    const minis = this.minis.minis().filter((mini) => mini.boxId === box.id);
    const rows = toMiniRows(minis, [box], this.factionNames.names(), this.parts.names());
    return sortRows(sortRows(rows, 'name', 'ascending'), 'status', 'descending');
  });
  protected readonly miniCount = computed(() => countMinis(this.miniRows()));

  /** The kit in the version the box records; none for boxes without a kit. */
  private readonly loadedKit = resource({
    params: () => this.storedBox()?.kit,
    loader: async ({ params: { id, version } }): Promise<Kit | undefined> => {
      const { kits, containedKits } = await this.catalogKits.find(id, version);
      return kits[0] && toKit(kits[0], containedKits);
    },
  });
  /** Left out while loading, when the kit can't be loaded and for boxes without a kit. */
  protected readonly kit = computed(() =>
    this.loadedKit.hasValue() ? this.loadedKit.value() : undefined,
  );
  protected readonly hasKitFailed = computed(() => this.loadedKit.error() !== undefined);
  /** The catalog answered, but without this version of the kit. */
  protected readonly isKitMissing = computed(
    () => this.loadedKit.status() === 'resolved' && this.loadedKit.value() === undefined,
  );

  protected readonly progress = computed(() => {
    const box = this.box();
    return box && progressOf(box);
  });
  protected readonly percent = computed(() => {
    const box = this.box();
    return box && percentOf(box);
  });
  protected readonly kitLine = computed(() => {
    const box = this.box();
    return box && kitLine(box);
  });
  /** Factions and date, e.g. "Orks · added 12 Oct 2026". */
  protected readonly meta = computed(() => {
    const box = this.box();
    return box && `${box.factions.join(', ')} · added ${formatDate(box.addedOn)}`;
  });
  /** Every status in pipeline order with its count, also zero. */
  protected readonly statuses = computed(() =>
    hobbyStatuses.map((status) => ({
      status,
      label: STATUS_LABELS[status],
      count: this.box()?.minis[status] ?? 0,
    })),
  );
  protected readonly hasMinisOnSprue = computed(() => (this.box()?.minis.sprue ?? 0) > 0);

  protected readonly statusColor = STATUS_COLORS;

  protected openMini(id: string): void {
    void this.router.navigate(['/hoard/minis', id]);
  }

  /** The Minis tab shows only the minis of this box: no search, only this box ticked. */
  protected filterHoardByBox(id: string): void {
    this.minisList.query.set('');
    this.minisList.resetFilters();
    this.minisList.boxFilter.set(new Set([id]));
  }

  /** Arrow keys, Home and End move between the items of the box menu. */
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

  constructor() {
    effect(() => {
      const box = this.box();
      if (box) {
        this.title.setTitle(`${eitherOrText(box.name)} · Greyhoarder`);
      }
    });
  }
}
