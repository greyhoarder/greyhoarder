import {
  afterNextRender,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  linkedSignal,
  signal,
  viewChildren,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { Router, RouterLink } from '@angular/router';
import { type HobbyStatus, hobbyStatuses, isGone, withStatus } from '@greyhoarder/domain/hoard';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideBox, lucideChevronDown, lucideChevronLeft, lucideEllipsisVertical } from '@ng-icons/lucide';
import { provideBrnPopoverDefaultOptions } from '@spartan-ng/brain/popover';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmPopoverImports } from '@spartan-ng/helm/popover';
import { HlmSkeleton } from '@spartan-ng/helm/skeleton';
import { HttpMinisAdapter } from '../../infrastructure/http-minis-adapter';
import { BoxesDeletion } from '../../application/boxes/boxes-deletion';
import { BoxesStore } from '../../data/boxes-store';
import { percentOf, progressOf, toBoxRows } from '../../application/boxes/box-row';
import { FactionNames } from '../../application/faction-names';
import { loadedKit } from '../../application/loaded-kit';
import { toMiniGroups } from './mini-group';
import { MiniSelection } from '../../application/minis/mini-selection';
import { changedText, MinisChangedNotice } from '../../application/minis/minis-changed-notice';
import { MinisDeletion } from '../../application/minis/minis-deletion';
import { countMinis, toMiniRows, toSingleRows } from '../../application/minis/mini-row';
import { sortRows } from '../../application/minis/mini-sort';
import { MinisStore } from '../../data/minis-store';
import { PartsStore } from '../../data/parts-store';
import { hasPercent } from '../../models/box-progress';
import { DeleteBoxDialog } from './delete-box-dialog/delete-box-dialog';
import { BoxKind } from '../../ui/box-kind/box-kind';
import { EditedBadge } from '../../ui/edited-badge/edited-badge';
import { AddedBar } from '../../ui/added-bar/added-bar';
import { DeleteMinisDialog } from '../../ui/delete-minis-dialog/delete-minis-dialog';
import { EmptyBoxesDialog } from '../../ui/empty-boxes-dialog/empty-boxes-dialog';
import { ProgressBadge } from '../../ui/progress-badge/progress-badge';
import { ProgressBar, STATUS_COLORS } from '../../ui/progress-bar/progress-bar';
import { RowCheck } from '../../ui/row-check/row-check';
import { SelectionBar } from '../../ui/selection-bar/selection-bar';
import { kitLine } from '../../util/box-labels';
import { eitherOrText } from '../../util/either-or';
import { formatDate } from '../../util/format-date';
import { DEPARTURE_LABELS, STATUS_LABELS } from '../../util/status-labels';
import { minisLabel } from '../../util/kit-labels';
import { BoxKitCard } from './box-kit-card/box-kit-card';
import { BoxGroupCard, type MiniSelectionChange, type StatusChoice } from './box-group-card/box-group-card';
import { BoxSprueCard, type SpruePanel } from './box-sprue-card/box-sprue-card';
import { EitherOrName } from '../../ui/either-or-name/either-or-name';
import { LongPress } from '../../ui/long-press/long-press';
import { MenuKeys } from '../../../../shared/ui/menu-keys/menu-keys';

/** Everything about one box of the hoard; specified in docs/screens/box.md. */
@Component({
  selector: 'app-box-detail-page',
  imports: [
    MenuKeys,
    NgTemplateOutlet,
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
    BoxGroupCard,
    BoxSprueCard,
    LongPress,
    RowCheck,
    SelectionBar,
    DeleteMinisDialog,
    EmptyBoxesDialog,
    DeleteBoxDialog,
    BoxKind,
    EditedBadge,
    AddedBar,
  ],
  providers: [
    provideIcons({
      lucideBox,
      lucideChevronDown,
      lucideChevronLeft,
      lucideEllipsisVertical,
    }),
    // The box menu is a menu, not a dialog; its list carries the role.
    provideBrnPopoverDefaultOptions({ role: undefined }),
    MinisDeletion,
    BoxesDeletion,
  ],
  templateUrl: './box-detail-page.html',
  host: { class: 'flex w-full flex-col gap-6 p-4 sm:p-8 lg:p-10' },
})
export class BoxDetailPage {
  /** From the route. */
  readonly id = input.required<string>();

  private readonly boxes = inject(BoxesStore);
  private readonly minis = inject(MinisStore);
  private readonly factionNames = inject(FactionNames);
  private readonly parts = inject(PartsStore);
  private readonly title = inject(Title);
  private readonly router = inject(Router);
  private readonly minisAdapter = inject(HttpMinisAdapter);
  protected readonly deletion = inject(MinisDeletion);
  protected readonly boxesDeletion = inject(BoxesDeletion);
  /** What the box's dialog asks: whether to delete it now that it is empty, or from its menu. */
  protected readonly boxQuestion = signal<'emptied' | 'delete'>('emptied');
  /** The mini page deleted the box's last mini and leads here to ask. */
  private readonly isEmptiedOnArrival = Boolean(this.router.currentNavigation()?.extras.state?.['isEmptied']);

  protected readonly isLoading = computed(() => this.boxes.isLoading() || this.minis.isLoading());
  protected readonly hasFailed = computed(() => this.boxes.hasFailed() || this.minis.hasFailed());

  protected readonly storedBox = computed(() => this.boxes.boxes().find((box) => box.id === this.id()));
  /** Undefined while loading and for a box that isn't in the hoard. */
  protected readonly box = computed(() => {
    const box = this.storedBox();
    return box && toBoxRows([box], this.boxMinis(), this.factionNames.names())[0];
  });
  /** Statuses chosen but not saved yet; shown at once, gone once saved or failed. */
  private readonly pendingStatuses = signal<ReadonlyMap<string, HobbyStatus>>(new Map());
  protected readonly hasSaveFailed = signal(false);

  /** The box's minis, with the statuses being saved. */
  protected readonly boxMinis = computed(() => {
    const boxId = this.storedBox()?.id;
    const pending = this.pendingStatuses();
    return this.minis
      .minis()
      .filter((mini) => mini.boxId === boxId)
      .map((mini) => {
        const status = pending.get(mini.id);
        return status === undefined ? mini : withStatus(mini, status);
      });
  });
  /** Gone minis have a section of their own. */
  private readonly presentMinis = computed(() => this.boxMinis().filter((mini) => !isGone(mini)));
  protected readonly groups = computed(() =>
    toMiniGroups(this.presentMinis(), this.factionNames.names(), this.parts.names()),
  );
  protected readonly builtCount = computed(() => this.groups().reduce((sum, group) => sum + group.minis.length, 0));
  /** Alike minis on the sprue as one row, by name. */
  protected readonly sprueRows = computed(() => {
    const box = this.storedBox();
    if (!box) {
      return [];
    }
    const minis = this.presentMinis().filter((mini) => mini.status === 'sprue');
    const rows = toMiniRows(minis, [box], this.factionNames.names(), this.parts.names());
    return sortRows(rows, 'name', 'ascending');
  });
  protected readonly sprueCount = computed(() => countMinis(this.sprueRows()));
  /** The card on the sprue that is open, and with which panel; at most one is. */
  protected readonly openSprue = signal<{ rowId: string; panel: SpruePanel } | undefined>(undefined);
  private readonly sprueCards = viewChildren(BoxSprueCard);

  /** Every gone mini on its own, by name, with its departure, e.g. "Sold on 12 Oct 2026". */
  protected readonly goneRows = computed(() => {
    const box = this.storedBox();
    if (!box) {
      return [];
    }
    const minis = this.boxMinis().filter(isGone);
    const rows = toSingleRows(minis, [box], this.factionNames.names(), this.parts.names());
    return sortRows(rows, 'name', 'ascending').map((row) => ({
      ...row,
      departureText: row.departure && `${DEPARTURE_LABELS[row.departure.reason]} on ${formatDate(row.departure.on)}`,
    }));
  });
  protected readonly goneCount = computed(() => countMinis(this.goneRows()));

  /** Built and gone minis are selected one by one; those on the sprue by their row's count. */
  protected readonly selection = new MiniSelection();
  private readonly selectableMinis = computed(() =>
    this.boxMinis().filter((mini) => mini.status !== 'sprue' || isGone(mini)),
  );
  private readonly selectedMinis = computed(() =>
    this.selectableMinis().filter((mini) => this.selection.selectedIds().has(mini.id)),
  );
  protected readonly selectedCount = computed(() => this.selectedMinis().length);
  /** Gone minis can't leave again; the others among the selected can. */
  protected readonly canLeave = computed(() => this.selectedMinis().some((mini) => !isGone(mini)));
  /** Closed at first, open when nothing else is left. */
  protected readonly isGoneOpen = linkedSignal(() => this.progress() === 'all-gone');

  protected readonly changedNotice = inject(MinisChangedNotice);
  /** How many minis selected here were just changed on Edit minis; none to tell. */
  protected readonly changedCount = computed(() => this.changedNotice.countFor(this.id()));
  protected readonly changedText = changedText;

  /** The kit in the version the box records; none for boxes without a kit. */
  private readonly loadedKit = loadedKit(() => this.storedBox()?.kit);
  protected readonly kit = this.loadedKit.kit;
  protected readonly hasKitFailed = this.loadedKit.hasFailed;
  protected readonly isKitMissing = this.loadedKit.isMissing;

  protected readonly progress = computed(() => {
    const box = this.box();
    return box && progressOf(box);
  });
  protected readonly hasPercentage = computed(() => {
    const progress = this.progress();
    return progress !== undefined && hasPercent(progress);
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
  protected readonly isEmpty = computed(() => this.progress() === 'empty');

  protected readonly statusColor = STATUS_COLORS;

  protected readonly minisLabel = minisLabel;

  protected selectMini({ miniId, isSelected }: MiniSelectionChange): void {
    this.selection.select(miniId, isSelected);
  }

  /** In selection mode a click on a gone mini's line selects it; otherwise it opens the mini. */
  protected onGoneClick(id: string): void {
    if (this.selection.isSelecting()) {
      this.selection.select(id, !this.selection.selectedIds().has(id));
    } else {
      this.openMini(id);
    }
  }

  /** Edit minis leads back here. */
  protected editSelected(): void {
    const ids = this.selectedMinis().map((mini) => mini.id);
    void this.router.navigate(['/hoard/minis/edit'], { queryParams: { ids: ids.join(','), box: this.id() } });
  }

  protected async deleteSelected(): Promise<void> {
    const { isDeleted, emptiedBoxIds } = await this.deletion.confirm();
    if (!isDeleted) {
      return;
    }
    this.selection.finish();
    this.askIfEmptied(emptiedBoxIds);
  }

  /** Deleted minis left the box without any; ask whether to delete it as well. */
  protected askIfEmptied(emptiedBoxIds: readonly string[]): void {
    if (emptiedBoxIds.includes(this.id())) {
      this.boxQuestion.set('emptied');
      this.boxesDeletion.ask([this.id()]);
    }
  }

  protected askToDeleteBox(): void {
    this.boxQuestion.set('delete');
    this.boxesDeletion.ask([this.id()]);
  }

  /** Gone with its minis; the Boxes tab is left. */
  protected async deleteBox(): Promise<void> {
    if (await this.boxesDeletion.confirm()) {
      this.toBoxes();
    }
  }

  /** Gone with its minis on the sprue, the others stay without a box; the Boxes tab is left. */
  protected async deleteBoxKeepingBuiltMinis(): Promise<void> {
    if (await this.boxesDeletion.confirmKeepingBuiltMinis()) {
      this.toBoxes();
    }
  }

  /** Edit box leads back here. */
  protected edit(): void {
    void this.router.navigate(['/hoard/boxes', this.id(), 'edit']);
  }

  /** The mini page leads back here. */
  protected openMini(id: string): void {
    void this.router.navigate(['/hoard/minis', id], { queryParams: { from: 'box' } });
  }

  protected openSprueCard(rowId: string, panel: SpruePanel | undefined): void {
    this.openSprue.set(panel === undefined ? undefined : { rowId, panel });
  }

  /** Opens the first card on the sprue to build and moves the focus into it. */
  protected takeFromSprue(): void {
    const [first] = this.sprueRows();
    if (first) {
      this.openSprueCard(first.id, 'build');
      this.sprueCards()[0]?.focusPanel();
    }
  }

  /** The box is deleted. */
  protected toBoxes(): void {
    void this.router.navigate(['/hoard/boxes'], { replaceUrl: true });
  }

  /** Saves the status of one mini at once; shows it while saving and the stored one if it fails. */
  protected async chooseStatus({ miniId, status }: StatusChoice): Promise<void> {
    this.hasSaveFailed.set(false);
    this.pendingStatuses.update((pending) => new Map(pending).set(miniId, status));
    try {
      this.minis.apply((await this.minisAdapter.update([miniId], { status })).minis);
    } catch {
      this.hasSaveFailed.set(true);
    } finally {
      this.pendingStatuses.update((pending) => {
        const rest = new Map(pending);
        rest.delete(miniId);
        return rest;
      });
    }
  }

  constructor() {
    // Told once on coming back to the box; leaving it ends that.
    inject(DestroyRef).onDestroy(() => this.changedNotice.dismiss());
    if (this.isEmptiedOnArrival) {
      // The id comes with the inputs, after construction.
      afterNextRender(() => this.askIfEmptied([this.id()]));
    }
    effect(() => {
      const box = this.box();
      if (box) {
        this.title.setTitle(`${eitherOrText(box.name)} · Greyhoarder`);
      }
    });
  }
}
