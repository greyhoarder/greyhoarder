import {
  computed,
  inject,
  Injectable,
  linkedSignal,
  resource,
  signal,
  untracked,
} from '@angular/core';
import {
  type Departure,
  findPart,
  type HobbyStatus,
  isGone,
  type Kit,
  type Mini,
  toKit,
} from '@greyhoarder/domain/hoard';
import { HttpCatalogPartsAdapter, HttpKitsAdapter } from '../../../catalog/api';
import { HttpMinisAdapter } from '../../infrastructure/http-minis-adapter';
import { areAlike } from '../../models/mini-alikeness';
import {
  type BuildSuggestion,
  buildSuggestions,
  looseSuggestions,
  preselectedParts,
} from '../../models/mini-build';
import type { MiniChanges, PartChange } from '../../models/mini-changes';
import type { PartOption } from '../../models/part-options';
import { eitherOrText } from '../../util/either-or';
import { BoxesStore } from '../../data/boxes-store';
import { FactionNames } from '../faction-names';
import { HoardChanges } from '../hoard-changes';
import { MinisStore } from '../../data/minis-store';
import { PartsStore } from '../../data/parts-store';

/** A part as the screen shows and edits it; a new part has a name but no id yet. */
export interface PartDraft {
  readonly partId?: string;
  readonly name: string;
  readonly isSwappable: boolean;
}

export type SaveState = 'saved' | 'saving' | 'failed';

/** Another mini named on the screen, e.g. as a recipient of parts or as their source. */
export interface MiniLink {
  readonly id: string;
  readonly name: string;
  /** The name of its box; none without a box. */
  readonly box?: string;
  /** For sources of parts: the day they were stripped. */
  readonly strippedOn?: string;
}

/**
 * One mini, or on its box the row of alike minis on the sprue: what is chosen while they are on the
 * sprue, building them, letting them leave the hoard or deleting them, and saving every change
 * afterwards (docs/screens/mini.md, docs/screens/box.md). Provided by the mini page and by each card
 * on the sprue of the box page, so each has its own, and what was chosen on the sprue goes with it.
 */
@Injectable()
export class MiniEditor {
  private readonly minisStore = inject(MinisStore);
  private readonly boxesStore = inject(BoxesStore);
  private readonly partsStore = inject(PartsStore);
  private readonly hoardChanges = inject(HoardChanges);
  private readonly factionNames = inject(FactionNames);
  private readonly minisAdapter = inject(HttpMinisAdapter);
  private readonly catalogKits = inject(HttpKitsAdapter);
  private readonly catalogParts = inject(HttpCatalogPartsAdapter);

  /** The mini of the address, or the first of a row. */
  readonly miniId = signal('');
  /**
   * Whether the minis alike to it are acted on with it: on the box, for a row on the sprue; on the
   * mini page only the one mini.
   */
  readonly withAlike = signal(false);

  readonly isLoading = computed(() => this.minisStore.isLoading() || this.boxesStore.isLoading());
  readonly hasFailed = computed(() => this.minisStore.hasFailed() || this.boxesStore.hasFailed());

  /** Undefined while loading and for a mini that isn't in the hoard. */
  readonly mini = computed(() => this.minisStore.minis().find((mini) => mini.id === this.miniId()));
  /** The mini first, then, with `withAlike`, every mini alike to it. */
  private readonly row = computed(() => {
    const mini = this.mini();
    if (!mini) {
      return [];
    }
    return this.withAlike()
      ? [
          mini,
          ...this.minisStore.minis().filter((other) => other !== mini && areAlike(other, mini)),
        ]
      : [mini];
  });
  readonly rowSize = computed(() => this.row().length);
  readonly isGone = computed(() => {
    const mini = this.mini();
    return mini !== undefined && isGone(mini);
  });
  /**
   * On the sprue and in the hoard: what is chosen waits for building. Gone minis on the sprue are
   * not built; their changes are saved at once.
   */
  readonly isOnSprue = computed(() => this.mini()?.status === 'sprue' && !this.isGone());

  readonly box = computed(() => {
    const boxId = this.mini()?.boxId;
    return boxId === undefined
      ? undefined
      : this.boxesStore.boxes().find((box) => box.id === boxId);
  });
  /** The kit of the minis' box, or else the catalog kit a mini without a box was added from. */
  private readonly kitReference = computed(() => {
    const mini = this.mini();
    return mini?.boxId === undefined ? mini?.kit : this.box()?.kit;
  });
  private readonly loadedKit = resource({
    params: () => this.kitReference(),
    loader: async ({ params: { id, version } }): Promise<Kit | undefined> => {
      const { kits, containedKits } = await this.catalogKits.find(id, version);
      return kits[0] && toKit(kits[0], containedKits);
    },
  });
  /** The kit of the minis' box or of a mini without one; left out while loading, when it can't be loaded and without a kit. */
  readonly kit = computed(() => (this.loadedKit.hasValue() ? this.loadedKit.value() : undefined));
  /** The name of the box, or else of the kit, as plain text, e.g. for "Suggested by {name}". */
  readonly originName = computed(() => {
    const name = this.box()?.name ?? this.kitReference()?.name;
    return name && eitherOrText(name);
  });

  /** The parts of the catalog kits of the minis' factions and those they are part of. */
  private readonly rangeParts = resource({
    params: () => {
      const factionIds = this.factionIds();
      return factionIds.length > 0 ? { factionIds } : undefined;
    },
    loader: ({ params: { factionIds } }) => this.catalogParts.rangeParts(factionIds),
  });
  /** What the part picker offers parts from, but the filter text. */
  readonly partSource = computed(() => ({
    kit: this.kit(),
    sprueName: this.mini()?.sprueName,
    vocabulary: this.partsStore.parts(),
    range: this.rangeParts.hasValue() ? this.rangeParts.value() : [],
    carried: this.parts().map((part) => part.name),
  }));
  /** Named after the minis' first faction, e.g. "Orks" for "Orks range". */
  readonly rangeName = computed(() => {
    const [factionId] = this.factionIds();
    return factionId === undefined
      ? undefined
      : (this.factionNames.names().get(factionId) ?? factionId);
  });

  /** Every mini of the minis' box, the row included; none without a box. */
  readonly minisOfBox = computed(() => {
    const boxId = this.box()?.id;
    return boxId === undefined
      ? []
      : this.minisStore.minis().filter((mini) => mini.boxId === boxId);
  });

  readonly suggestions = computed((): readonly BuildSuggestion[] => {
    const mini = this.mini();
    const kit = this.kit();
    if (mini === undefined) {
      return [];
    }
    if (mini.boxId === undefined) {
      return looseSuggestions(mini, kit);
    }
    return kit ? buildSuggestions(kit, this.minisOfBox(), mini.sprueName) : [];
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
  readonly ownName = linkedSignal(() => {
    const mini = this.mini();
    return mini && mini.status !== 'sprue' && !this.suggestedNames().includes(mini.name)
      ? mini.name
      : '';
  });
  /** Once the user changed the parts, choosing another name keeps them. */
  readonly partsChanged = linkedSignal({ source: () => this.mini()?.id, computation: () => false });
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
  private readonly chosenFactionIds = linkedSignal(() => this.mini()?.factionIds ?? []);
  /** Building puts the minis on the workbench, unless the user unticks it. */
  private readonly chosenWorkbench = linkedSignal({
    source: () => this.mini()?.id,
    computation: () => true,
  });
  /** How many minis of the row to build. */
  readonly count = linkedSignal({ source: () => this.mini()?.id, computation: () => 1 });
  readonly notes = linkedSignal(() => this.mini()?.notes ?? '');

  // What the screen shows: the choices on the sprue, the stored minis past it.
  /** What the minis are built as: the typed own name or the chosen suggestion; maybe none yet. */
  readonly buildName = computed(() => this.ownName().trim() || this.chosenName());
  /** The title: past the sprue the stored name; on the sprue the name to build, or else the mini's. */
  readonly name = computed(() =>
    this.isOnSprue() ? this.buildName() || (this.mini()?.name ?? '') : (this.mini()?.name ?? ''),
  );
  readonly status = computed(() => this.mini()?.status ?? 'sprue');
  readonly factionIds = computed(() =>
    this.isOnSprue() ? this.chosenFactionIds() : (this.mini()?.factionIds ?? []),
  );
  readonly isOnWorkbench = computed(() =>
    this.isOnSprue() ? this.chosenWorkbench() : (this.mini()?.isOnWorkbench ?? false),
  );
  readonly parts = computed(() =>
    this.isOnSprue() ? this.chosenParts() : this.toPartDrafts(this.mini()?.parts ?? []),
  );

  /** For a gone mini stripped for parts: the minis that got them. */
  readonly recipients = computed(() => {
    const ids = new Set(this.mini()?.departure?.recipientMiniIds ?? []);
    return this.links(this.minisStore.minis().filter((mini) => ids.has(mini.id)));
  });
  /** The minis stripped for parts that went into this mini. */
  readonly partsFrom = computed(() => {
    const id = this.mini()?.id;
    return this.links(
      this.minisStore
        .minis()
        .filter((mini) => id !== undefined && mini.departure?.recipientMiniIds?.includes(id)),
    );
  });
  /** What can get the parts of these minis: every other mini past the sprue that is not gone. */
  readonly recipientChoices = computed(() => {
    const ids = new Set(this.row().map((mini) => mini.id));
    return this.links(
      this.minisStore
        .minis()
        .filter((mini) => !ids.has(mini.id) && !isGone(mini) && mini.status !== 'sprue'),
    );
  });

  readonly isBuilding = signal(false);
  readonly saveState = signal<SaveState>('saved');

  /** Past the sprue; building is what takes minis off it. */
  setStatus(status: HobbyStatus): void {
    void this.save({ status });
  }

  toggleWorkbench(): void {
    if (this.isOnSprue()) {
      this.chosenWorkbench.update((isOnWorkbench) => !isOnWorkbench);
      return;
    }
    void this.save({ isOnWorkbench: !this.isOnWorkbench() });
  }

  /** On the sprue, whether building puts the minis on the workbench. */
  setBuildWorkbench(isOnWorkbench: boolean): void {
    this.chosenWorkbench.set(isOnWorkbench);
  }

  chooseName(name: string): void {
    this.ownName.set('');
    if (this.isOnSprue()) {
      this.chosenName.set(name);
      return;
    }
    if (name !== this.name()) {
      void this.save({ name });
    }
  }

  /** Past the sprue an own name is saved once typed, when the field loses focus or on Enter. */
  commitOwnName(): void {
    const name = this.ownName().trim();
    if (!this.isOnSprue() && name !== '' && name !== this.name()) {
      void this.save({ name });
    }
  }

  /** The names of the factions given here; the hoard knows only those its minis and boxes have. */
  readonly addedFactionNames = signal<ReadonlyMap<string, string>>(new Map());

  addFaction({ id, name }: { readonly id: string; readonly name: string }): void {
    this.addedFactionNames.update((names) => new Map([...names, [id, name]]));
    if (this.factionIds().includes(id)) {
      return;
    }
    const factionIds = [...this.factionIds(), id];
    if (this.isOnSprue()) {
      this.chosenFactionIds.set(factionIds);
      return;
    }
    void this.save({ factionIds });
  }

  removeFaction(id: string): void {
    const factionIds = this.factionIds().filter((factionId) => factionId !== id);
    if (this.isOnSprue()) {
      this.chosenFactionIds.set(factionIds);
      return;
    }
    void this.save({ factionIds });
  }

  removePart(index: number): void {
    this.changeParts(this.parts().filter((_, other) => other !== index));
  }

  toggleSwappable(index: number): void {
    this.changeParts(
      this.parts().map((part, other) =>
        other === index ? { ...part, isSwappable: !part.isSwappable } : part,
      ),
    );
  }

  /** Adds a part the picker offers, or a new one by name, as glued. */
  addPart(part: PartOption | string): void {
    const draft: PartDraft =
      typeof part === 'string'
        ? { name: part, isSwappable: false }
        : { partId: part.partId, name: part.name, isSwappable: false };
    this.changeParts([...this.parts(), draft]);
  }

  /** Past the sprue the notes are saved when the text area loses focus. */
  commitNotes(): void {
    if (!this.isOnSprue() && this.notes() !== (this.mini()?.notes ?? '')) {
      void this.save({ notes: this.notes() });
    }
  }

  changeCount(by: number): void {
    this.count.update((count) => Math.min(this.rowSize(), Math.max(1, count + by)));
  }

  /**
   * Builds as many minis of the row as chosen, the first one first, with everything
   * chosen; the rest of the row stays on the sprue.
   */
  async build(): Promise<void> {
    const ids = this.row()
      .slice(0, this.count())
      .map((mini) => mini.id);
    this.isBuilding.set(true);
    try {
      const changed = await this.minisAdapter.update(ids, {
        name: this.buildName(),
        status: 'built',
        factionIds: this.chosenFactionIds(),
        parts: this.parts().map(toPartChange),
        notes: this.notes(),
        isOnWorkbench: this.chosenWorkbench(),
      });
      this.afterSave(changed);
    } catch {
      this.saveState.set('failed');
    } finally {
      this.isBuilding.set(false);
    }
  }

  /** Lets as many minis of the row as given leave the hoard, the first one first. */
  async leave(departure: Departure, count: number): Promise<boolean> {
    const ids = this.firstOfRow(count);
    this.saveState.set('saving');
    try {
      this.afterSave(await this.minisAdapter.update(ids, { departure }));
      return true;
    } catch {
      this.saveState.set('failed');
      return false;
    }
  }

  /** Brings the gone mini back into the hoard. */
  comeBack(): void {
    void this.save({ departure: null });
  }

  /**
   * Deletes as many minis of the row as given for good, the first one first.
   *
   * @returns whether they are deleted, and the ids of the boxes left without any minis; boxes stay
   */
  async delete(
    count: number,
  ): Promise<{ readonly isDeleted: boolean; readonly emptiedBoxIds: readonly string[] }> {
    const ids = this.firstOfRow(count);
    this.saveState.set('saving');
    try {
      const { emptiedBoxIds, minis } = await this.minisAdapter.delete(ids);
      this.hoardChanges.removed(ids, minis);
      this.saveState.set('saved');
      return { isDeleted: true, emptiedBoxIds };
    } catch {
      this.saveState.set('failed');
      return { isDeleted: false, emptiedBoxIds: [] };
    }
  }

  private firstOfRow(count: number): string[] {
    return this.row()
      .slice(0, count)
      .map((mini) => mini.id);
  }

  private changeParts(parts: readonly PartDraft[]): void {
    if (this.isOnSprue()) {
      this.chosenParts.set(parts);
      this.partsChanged.set(true);
      return;
    }
    void this.save({ parts: parts.map(toPartChange) });
  }

  /** Saves a change of every mini of the row at once; a row stays alike. */
  private async save(changes: MiniChanges): Promise<void> {
    this.saveState.set('saving');
    try {
      const changed = await this.minisAdapter.update(
        this.row().map((mini) => mini.id),
        changes,
      );
      this.afterSave(changed);
    } catch {
      this.saveState.set('failed');
    }
  }

  /** Shows what the server stored. */
  private afterSave(changed: readonly Mini[]): void {
    this.saveState.set('saved');
    this.hoardChanges.changed(changed);
  }

  private links(minis: readonly Mini[]): MiniLink[] {
    const boxNames = new Map(this.boxesStore.boxes().map((box) => [box.id, box.name]));
    return minis.map((mini) => ({
      id: mini.id,
      name: mini.name,
      box: mini.boxId === undefined ? undefined : boxNames.get(mini.boxId),
      strippedOn: mini.departure?.reason === 'stripped' ? mini.departure.on : undefined,
    }));
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
