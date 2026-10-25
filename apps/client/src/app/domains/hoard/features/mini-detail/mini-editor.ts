import {
  computed,
  inject,
  Injectable,
  linkedSignal,
  resource,
  signal,
  untracked,
} from '@angular/core';
import { findPart, type HobbyStatus, type Kit, type Mini, toKit } from '@greyhoarder/domain/hoard';
import { HttpKitsAdapter } from '../../../catalog/api';
import { BoxesStore } from '../../data/boxes-store';
import { MinisStore } from '../../data/minis-store';
import { PartsStore } from '../../data/parts-store';
import { HttpMinisAdapter } from '../../infrastructure/http-minis-adapter';
import { areAlike } from '../../models/mini-alikeness';
import { buildSuggestions, preselectedParts } from '../../models/mini-build';
import type { MiniChanges, PartChange } from '../../models/mini-changes';
import type { PartOption } from '../../models/part-options';

/** A part as the screen shows and edits it; a new part has a name but no id yet. */
export interface PartDraft {
  readonly partId?: string;
  readonly name: string;
  readonly isSwappable: boolean;
}

export type SaveState = 'saved' | 'saving' | 'failed';

/**
 * The row of alike minis one mini page is about: what is chosen while they are on the sprue, building
 * them, and saving every change afterwards (docs/screens/mini.md). Provided by the page, so each
 * opened mini has its own, and what was chosen on the sprue goes when the page closes.
 */
@Injectable()
export class MiniEditor {
  private readonly minisStore = inject(MinisStore);
  private readonly boxesStore = inject(BoxesStore);
  private readonly partsStore = inject(PartsStore);
  private readonly minisAdapter = inject(HttpMinisAdapter);
  private readonly catalogKits = inject(HttpKitsAdapter);

  /** The mini of the address, the first of its row. */
  readonly miniId = signal('');

  readonly isLoading = computed(() => this.minisStore.isLoading() || this.boxesStore.isLoading());
  readonly hasFailed = computed(() => this.minisStore.hasFailed() || this.boxesStore.hasFailed());

  /** Undefined while loading and for a mini that isn't in the hoard. */
  readonly mini = computed(() => this.minisStore.minis().find((mini) => mini.id === this.miniId()));
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
  readonly rowSize = computed(() => this.row().length);
  readonly isOnSprue = computed(() => this.mini()?.status === 'sprue');

  readonly box = computed(() => {
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
  /** The kit of the minis' box; left out while loading, when it can't be loaded and without a box. */
  readonly kit = computed(() => (this.loadedKit.hasValue() ? this.loadedKit.value() : undefined));

  /** Every mini of the minis' box, the row included; none without a box. */
  readonly minisOfBox = computed(() => {
    const boxId = this.box()?.id;
    return boxId === undefined
      ? []
      : this.minisStore.minis().filter((mini) => mini.boxId === boxId);
  });

  readonly suggestions = computed(() => {
    const kit = this.kit();
    return kit ? buildSuggestions(kit, this.minisOfBox(), this.mini()?.sprueName) : [];
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
   * Builds as many minis of the row as chosen, the one of the address first, with everything
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
