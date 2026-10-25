import { NgTemplateOutlet } from '@angular/common';
import {
  Component,
  computed,
  effect,
  inject,
  input,
  linkedSignal,
  resource,
  signal,
  untracked,
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import {
  findPart,
  leavesWorkbench,
  type HobbyStatus,
  hobbyStatuses,
  type Kit,
  type Mini,
  toKit,
} from '@greyhoarder/domain/hoard';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideBrush,
  lucideCamera,
  lucideChevronLeft,
  lucideChevronRight,
  lucideEllipsisVertical,
  lucideHammer,
  lucideMagnet,
  lucideMinus,
  lucidePackage,
  lucidePlus,
  lucideSearch,
  lucideX,
} from '@ng-icons/lucide';
import { provideBrnPopoverDefaultOptions } from '@spartan-ng/brain/popover';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmCheckbox } from '@spartan-ng/helm/checkbox';
import { HlmPopoverImports } from '@spartan-ng/helm/popover';
import { HlmSkeleton } from '@spartan-ng/helm/skeleton';
import { HttpCatalogPartsAdapter, HttpKitsAdapter } from '../../../catalog/api';
import { BoxesStore } from '../../data/boxes-store';
import { FactionNamesStore } from '../../data/faction-names-store';
import { MinisStore } from '../../data/minis-store';
import { PartsStore } from '../../data/parts-store';
import { HttpMinisAdapter } from '../../infrastructure/http-minis-adapter';
import { areAlike } from '../../models/mini-alikeness';
import { buildStatus, buildSuggestions, preselectedParts } from '../../models/mini-build';
import type { MiniChanges, PartChange } from '../../models/mini-changes';
import { type PartOption, partOptions } from '../../models/part-options';
import { StatusBadge } from '../../ui/status-badge/status-badge';
import { STATUS_COLORS } from '../../ui/progress-bar/progress-bar';
import { formatDate } from '../../util/format-date';
import { STATUS_LABELS } from '../../util/status-labels';

/** A part as the screen shows and edits it; a new part has a name but no id yet. */
interface PartDraft {
  readonly partId?: string;
  readonly name: string;
  readonly isSwappable: boolean;
}

type SaveState = 'saved' | 'saving' | 'failed';

/**
 * One mini, or one row of alike minis: building it while on the sprue, editing it afterwards.
 * Specified in docs/screens/mini.md.
 */
@Component({
  selector: 'app-mini-detail-page',
  imports: [
    NgTemplateOutlet,
    RouterLink,
    NgIcon,
    HlmButton,
    HlmCheckbox,
    HlmPopoverImports,
    HlmSkeleton,
    StatusBadge,
  ],
  providers: [
    provideIcons({
      lucideBrush,
      lucideCamera,
      lucideChevronLeft,
      lucideChevronRight,
      lucideEllipsisVertical,
      lucideHammer,
      lucideMagnet,
      lucideMinus,
      lucidePackage,
      lucidePlus,
      lucideSearch,
      lucideX,
    }),
    // The mini menu is a menu, not a dialog; its list carries the role.
    provideBrnPopoverDefaultOptions({ role: undefined }),
  ],
  templateUrl: './mini-detail-page.html',
  // Unfolding by grid rows needs no measured height; Tailwind has no class for these values.
  styles: `
    [data-part-picker] {
      display: grid;
      grid-template-rows: 0fr;
      opacity: 0;
      transition:
        grid-template-rows 260ms ease,
        opacity 140ms ease;
    }
    [data-part-picker][data-open='true'] {
      grid-template-rows: 1fr;
      opacity: 1;
      transition:
        grid-template-rows 260ms ease,
        opacity 200ms ease 60ms;
    }
    @media (prefers-reduced-motion: reduce) {
      [data-part-picker],
      [data-part-picker][data-open='true'] {
        transition: none;
      }
    }
  `,
  host: { class: 'flex w-full flex-col gap-6 p-4 sm:p-8 lg:p-10' },
})
export class MiniDetailPage {
  /** From the route: the first mini of the row. */
  readonly id = input.required<string>();

  private readonly minisStore = inject(MinisStore);
  private readonly boxesStore = inject(BoxesStore);
  private readonly factionNames = inject(FactionNamesStore);
  private readonly partsStore = inject(PartsStore);
  private readonly minisAdapter = inject(HttpMinisAdapter);
  private readonly catalogKits = inject(HttpKitsAdapter);
  private readonly catalogParts = inject(HttpCatalogPartsAdapter);
  private readonly title = inject(Title);

  protected readonly isLoading = computed(
    () => this.minisStore.isLoading() || this.boxesStore.isLoading(),
  );
  protected readonly hasFailed = computed(
    () => this.minisStore.hasFailed() || this.boxesStore.hasFailed(),
  );

  /** Undefined while loading and for a mini that isn't in the hoard. */
  protected readonly mini = computed(() =>
    this.minisStore.minis().find((mini) => mini.id === this.id()),
  );
  /** The mini of the address first, then every mini alike to it. */
  private readonly row = computed(() => {
    const mini = this.mini();
    return mini
      ? [
          mini,
          ...this.minisStore.minis().filter((other) => other !== mini && areAlike(other, mini)),
        ]
      : [];
  });
  protected readonly rowSize = computed(() => this.row().length);
  protected readonly isOnSprue = computed(() => this.mini()?.status === 'sprue');

  protected readonly box = computed(() => {
    const boxId = this.mini()?.boxId;
    return boxId === undefined
      ? undefined
      : this.boxesStore.boxes().find((box) => box.id === boxId);
  });
  private readonly loadedKit = resource({
    params: () => this.box()?.kit,
    loader: async ({ params: { id, version } }): Promise<Kit | undefined> => {
      const { kits, containedKits } = await this.catalogKits.find(id, version);
      return kits[0] && toKit(kits[0], containedKits);
    },
  });
  private readonly kit = computed(() =>
    this.loadedKit.hasValue() ? this.loadedKit.value() : undefined,
  );

  protected readonly suggestions = computed(() => {
    const kit = this.kit();
    const box = this.box();
    return kit && box
      ? buildSuggestions(
          kit,
          this.minisStore.minis().filter((mini) => mini.boxId === box.id),
        )
      : [];
  });
  private readonly suggestedNames = computed(() =>
    this.suggestions().map((suggestion) => suggestion.name),
  );

  // What is chosen while on the sprue; nothing of it is saved until the minis are built.
  /** The chosen suggestion; at first the mini's own name when it is one, else none. */
  private readonly chosenName = linkedSignal(() => {
    const mini = this.mini();
    return mini && this.suggestedNames().includes(mini.name) ? mini.name : '';
  });
  /** Typed into "Your own name"; past the sprue the mini's name when no suggestion has it. */
  protected readonly ownName = linkedSignal(() => {
    const mini = this.mini();
    return mini && mini.status !== 'sprue' && !this.suggestedNames().includes(mini.name)
      ? mini.name
      : '';
  });
  /** Once the user changed the parts, choosing another name keeps them. */
  private readonly partsChanged = linkedSignal({
    source: () => this.mini()?.id,
    computation: () => false,
  });
  private readonly chosenParts = linkedSignal<
    { name: string; kit: Kit | undefined },
    readonly PartDraft[]
  >({
    source: () => ({ name: this.buildName(), kit: this.kit() }),
    // Only a new name or kit preselects again; the minis and the vocabulary loading anew don't.
    computation: ({ name, kit }, previous) =>
      untracked(() =>
        previous && this.partsChanged()
          ? previous.value
          : this.toPartDrafts(preselectedParts(this.minisStore.minis(), kit, name)),
      ),
  });
  private readonly chosenStatus = linkedSignal<HobbyStatus>(() => this.mini()?.status ?? 'sprue');
  private readonly chosenFactionIds = linkedSignal(() => this.mini()?.factionIds ?? []);
  /** Building puts the minis on the workbench, unless the user unticks it. */
  private readonly chosenWorkbench = linkedSignal({
    source: () => this.mini()?.id,
    computation: () => true,
  });
  protected readonly count = linkedSignal({ source: () => this.mini()?.id, computation: () => 1 });
  protected readonly notes = linkedSignal(() => this.mini()?.notes ?? '');

  // What the screen shows: the choices on the sprue, the stored minis past it.
  /** What the minis are built as: the typed own name or the chosen suggestion; maybe none yet. */
  protected readonly buildName = computed(() => this.ownName().trim() || this.chosenName());
  /** The title: past the sprue the stored name; on the sprue the name to build, or else the mini's. */
  protected readonly name = computed(() =>
    this.isOnSprue() ? this.buildName() || (this.mini()?.name ?? '') : (this.mini()?.name ?? ''),
  );
  protected readonly status = computed(() =>
    this.isOnSprue() ? this.chosenStatus() : (this.mini()?.status ?? 'sprue'),
  );
  protected readonly factionIds = computed(() =>
    this.isOnSprue() ? this.chosenFactionIds() : (this.mini()?.factionIds ?? []),
  );
  protected readonly isOnWorkbench = computed(() =>
    this.isOnSprue() ? this.chosenWorkbench() : (this.mini()?.isOnWorkbench ?? false),
  );
  protected readonly parts = computed(() =>
    this.isOnSprue() ? this.chosenParts() : this.toPartDrafts(this.mini()?.parts ?? []),
  );

  protected readonly factions = computed(() =>
    this.factionIds().map((id) => ({ id, name: this.factionNames.names().get(id) ?? id })),
  );
  protected readonly origin = computed(() => {
    const box = this.box();
    return box && `From ${box.name} · added ${formatDate(box.addedOn)}`;
  });

  protected readonly statusTiles = computed(() => {
    const current = hobbyStatuses.indexOf(this.status());
    return hobbyStatuses.map((status, index) => ({
      status,
      label: STATUS_LABELS[status],
      isCurrent: index === current,
      isPast: index < current,
      /** The sprue has no bar; bars up to the current status take its color. */
      bar: index === 0 ? undefined : index <= current ? STATUS_COLORS[this.status()] : 'bg-muted',
    }));
  });

  protected readonly nameTiles = computed(() =>
    this.suggestions().map(({ name, left }) => {
      const isChosen = this.ownName().trim() === '' && name === this.name();
      const isTooMany = isChosen && this.isOnSprue() && this.count() > left;
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
  protected readonly boxName = computed(() => this.box()?.name);

  protected readonly partsHint = computed(() =>
    this.isOnSprue() && !this.partsChanged() && this.parts().length > 0
      ? `Preselected for ${this.buildName()} — change what you actually built`
      : 'What is physically on this mini',
  );

  protected readonly isPickerOpen = signal(false);
  protected readonly filter = signal('');
  /** The parts of the catalog kits of the minis' factions and those they are part of. */
  private readonly loadedRangeParts = resource({
    params: () => {
      const factionIds = this.factionIds();
      return factionIds.length > 0 ? { factionIds } : undefined;
    },
    loader: ({ params: { factionIds } }) => this.catalogParts.rangeParts(factionIds),
  });
  /** Named after the minis' first faction, e.g. "Orks range". */
  protected readonly rangeName = computed(() => this.factions()[0]?.name);
  protected readonly options = computed(() =>
    partOptions(
      {
        kit: this.kit(),
        vocabulary: this.partsStore.parts(),
        range: this.loadedRangeParts.hasValue() ? this.loadedRangeParts.value() : [],
        carried: this.parts().map((part) => part.name),
      },
      this.filter(),
    ),
  );

  protected readonly summary = computed(() => {
    const name = this.buildName();
    if (name === '') {
      return 'Choose what to build.';
    }
    const parts = this.parts().map((part) =>
      part.isSwappable ? `${part.name} (swappable)` : part.name,
    );
    const what = parts.length > 0 ? `${name} with ${parts.join(', ')}.` : `${name}, no parts.`;
    if (this.rowSize() === 1) {
      return `This mini becomes ${what}`;
    }
    return `${this.count()} of ${this.rowSize()} alike minis ${this.count() === 1 ? 'becomes' : 'become'} ${what}`;
  });

  protected readonly isBuilding = signal(false);
  protected readonly saveState = signal<SaveState>('saved');

  protected readonly menuItems = [
    { label: 'Duplicate mini', testId: 'mini-duplicate', isDestructive: false },
    { label: 'Change origin box…', testId: 'mini-change-origin', isDestructive: false },
    { label: 'Delete mini…', testId: 'mini-delete', isDestructive: true },
  ] as const;

  constructor() {
    effect(() => {
      const name = this.name();
      if (this.mini()) {
        this.title.setTitle(`${name} · Greyhoarder`);
      }
    });
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

  protected setStatus(status: HobbyStatus): void {
    if (this.isOnSprue()) {
      this.chosenStatus.set(status);
      if (leavesWorkbench(status)) {
        this.chosenWorkbench.set(false);
      }
      return;
    }
    void this.save({ status });
  }

  protected toggleWorkbench(): void {
    if (this.isOnSprue()) {
      this.chosenWorkbench.update((isOnWorkbench) => !isOnWorkbench);
      return;
    }
    void this.save({ isOnWorkbench: !this.isOnWorkbench() });
  }

  protected chooseName(name: string): void {
    this.ownName.set('');
    if (this.isOnSprue()) {
      this.chosenName.set(name);
      return;
    }
    if (name !== this.name()) {
      void this.save({ name });
    }
  }

  protected typeOwnName(event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      this.ownName.set(event.target.value);
    }
  }

  /** Past the sprue an own name is saved once typed, when the field loses focus or on Enter. */
  protected commitOwnName(): void {
    const name = this.ownName().trim();
    if (!this.isOnSprue() && name !== '' && name !== this.name()) {
      void this.save({ name });
    }
  }

  protected removeFaction(id: string): void {
    const factionIds = this.factionIds().filter((factionId) => factionId !== id);
    if (this.isOnSprue()) {
      this.chosenFactionIds.set(factionIds);
      return;
    }
    void this.save({ factionIds });
  }

  protected removePart(index: number): void {
    this.changeParts(this.parts().filter((_, other) => other !== index));
  }

  protected toggleSwappable(index: number): void {
    this.changeParts(
      this.parts().map((part, other) =>
        other === index ? { ...part, isSwappable: !part.isSwappable } : part,
      ),
    );
  }

  protected addPart(option: PartOption): void {
    this.changeParts([
      ...this.parts(),
      { partId: option.partId, name: option.name, isSwappable: false },
    ]);
    this.filter.set('');
  }

  protected createPart(name: string): void {
    this.changeParts([...this.parts(), { name, isSwappable: false }]);
    this.filter.set('');
  }

  protected typeFilter(event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      this.filter.set(event.target.value);
    }
  }

  protected togglePicker(): void {
    this.isPickerOpen.update((isOpen) => !isOpen);
    this.filter.set('');
  }

  protected typeNotes(event: Event): void {
    if (event.target instanceof HTMLTextAreaElement) {
      this.notes.set(event.target.value);
    }
  }

  /** Past the sprue the notes are saved when the text area loses focus. */
  protected commitNotes(): void {
    if (!this.isOnSprue() && this.notes() !== (this.mini()?.notes ?? '')) {
      void this.save({ notes: this.notes() });
    }
  }

  protected changeCount(by: number): void {
    this.count.update((count) => Math.min(this.rowSize(), Math.max(1, count + by)));
  }

  protected setBuildWorkbench(isOnWorkbench: boolean): void {
    this.chosenWorkbench.set(isOnWorkbench);
  }

  /**
   * Builds as many minis of the row as chosen, the one of the address first, with everything
   * chosen; the rest of the row stays on the sprue.
   */
  protected async build(): Promise<void> {
    const ids = this.row()
      .slice(0, this.count())
      .map((mini) => mini.id);
    const status = buildStatus(this.chosenStatus());
    this.isBuilding.set(true);
    try {
      const changed = await this.minisAdapter.update(ids, {
        name: this.buildName(),
        status,
        factionIds: this.chosenFactionIds(),
        parts: this.parts().map(toPartChange),
        notes: this.notes(),
        isOnWorkbench: !leavesWorkbench(status) && this.chosenWorkbench(),
      });
      this.afterSave(changed, this.parts());
    } catch {
      this.saveState.set('failed');
    } finally {
      this.isBuilding.set(false);
    }
  }

  private changeParts(parts: readonly PartDraft[]): void {
    if (this.isOnSprue()) {
      this.chosenParts.set(parts);
      this.partsChanged.set(true);
      return;
    }
    void this.save({ parts: parts.map(toPartChange) });
  }

  /** Saves a change of every mini of the row at once; they stay alike. */
  private async save(changes: MiniChanges): Promise<void> {
    this.saveState.set('saving');
    try {
      const changed = await this.minisAdapter.update(
        this.row().map((mini) => mini.id),
        changes,
      );
      this.afterSave(changed, changes.parts ?? []);
    } catch {
      this.saveState.set('failed');
    }
  }

  /** Shows what the server stored; the vocabulary loads anew only when parts were added to it by name. */
  private afterSave(changed: readonly Mini[], parts: readonly (PartDraft | PartChange)[]): void {
    this.saveState.set('saved');
    this.minisStore.apply(changed);
    if (parts.some((part) => !('partId' in part) || part.partId === undefined)) {
      this.partsStore.reload();
    }
  }

  /** Parts of a mini, or kit parts by name, which refer to the vocabulary's part once it has one. */
  private toPartDrafts(parts: Mini['parts'] | readonly string[]): PartDraft[] {
    const names = this.partsStore.names();
    return parts.map((part) => {
      if (typeof part !== 'string') {
        return { ...part, name: names.get(part.partId) ?? '' };
      }
      const known = findPart(this.partsStore.parts(), part);
      return known
        ? { partId: known.id, name: known.name, isSwappable: false }
        : { name: part, isSwappable: false };
    });
  }
}

function toPartChange(part: PartDraft): PartChange {
  return part.partId === undefined
    ? { name: part.name, isSwappable: part.isSwappable }
    : { partId: part.partId, isSwappable: part.isSwappable };
}
