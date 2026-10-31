import { computed, inject, Injectable, resource, signal } from '@angular/core';
import { type HobbyStatus, isGone, isOwnFaction } from '@greyhoarder/domain/hoard';
import { HttpCatalogPartsAdapter } from '../../../catalog/api';
import { FactionNames } from '../../application/faction-names';
import { HoardChanges } from '../../application/hoard-changes';
import { namesOf } from '../../application/minis/mini-names';
import { BoxesStore } from '../../data/boxes-store';
import { MinisStore } from '../../data/minis-store';
import { PartsStore } from '../../data/parts-store';
import { HttpMinisAdapter } from '../../infrastructure/http-minis-adapter';
import { type FactionDraft, hasFaction, isOwnDraft, toFactionChange } from '../../models/faction-draft';
import type { PartOption } from '../../models/part-options';
import {
  changesSummary,
  type ChangesToSelectedMinis,
  factionShares,
  mixedStatus,
  partShares,
  sharedStatus,
  workbenchRefusals,
} from '../../models/selected-minis';

export type WorkbenchChoice = 'keep' | 'put-on' | 'take-off';

/** What becomes of a faction or part shown on the page when the changes are applied. */
export type ChangeMark = 'kept' | 'added' | 'removed';

/** A faction as the page shows it: one the minis carry, or one to be added. */
export interface FactionChip {
  /** New own factions have none yet. */
  readonly id?: string;
  readonly name: string;
  readonly isOwn: boolean;
  /** How many of the minis carry it now. */
  readonly count: number;
  readonly mark: ChangeMark;
}

/** A part as the page shows it: one the minis carry, or one to be added. */
export interface PartTile {
  /** New parts of the vocabulary have none yet. */
  readonly partId?: string;
  readonly name: string;
  /** How many of the minis carry it now. */
  readonly count: number;
  readonly carried: 'glued' | 'swappable' | 'mixed';
  readonly mark: ChangeMark;
}

/** A part to be added that none of the minis carries yet. */
interface NewPart {
  readonly partId?: string;
  readonly name: string;
  readonly isSwappable: boolean;
}

/**
 * Several selected minis changed in one go: what they have now, what the user changes, and applying
 * it to all of them at once (docs/screens/edit-minis.md). Nothing is saved before applying.
 */
@Injectable()
export class SeveralMinisEditor {
  private readonly minisStore = inject(MinisStore);
  private readonly boxesStore = inject(BoxesStore);
  private readonly partsStore = inject(PartsStore);
  private readonly factionNames = inject(FactionNames);
  private readonly hoardChanges = inject(HoardChanges);
  private readonly adapter = inject(HttpMinisAdapter);
  private readonly catalogParts = inject(HttpCatalogPartsAdapter);

  /** The ids of the selected minis. */
  readonly ids = signal<readonly string[]>([]);

  readonly isLoading = computed(() => this.minisStore.isLoading() || this.boxesStore.isLoading());
  readonly hasFailed = computed(() => this.minisStore.hasFailed() || this.boxesStore.hasFailed());

  /** The selected minis still in the hoard, gone ones included, in the order selected. */
  readonly minis = computed(() => {
    const byId = new Map(this.minisStore.minis().map((mini) => [mini.id, mini]));
    return this.ids().flatMap((id) => byId.get(id) ?? []);
  });
  readonly count = computed(() => this.minis().length);
  /** Selected ids no mini of the hoard has, e.g. of minis deleted meanwhile. */
  readonly missingCount = computed(() => this.ids().length - this.count());
  /** E.g. "Boy ×3, Nob ×2". */
  readonly names = computed(() => namesOf(this.minis()));
  readonly goneCount = computed(() => this.minis().filter(isGone).length);

  // Status
  /** The status to set on every mini; none keeps each mini's own. */
  readonly status = signal<HobbyStatus | undefined>(undefined);
  /** The chosen status, else the one the minis share. */
  readonly shownStatus = computed(() => this.status() ?? sharedStatus(this.minis()));
  /** E.g. "Mixed: 3 built, 2 primed"; none while the minis share a status. */
  readonly mixedStatus = computed(() =>
    sharedStatus(this.minis()) === undefined ? mixedStatus(this.minis()) : undefined,
  );

  // Workbench
  readonly workbench = signal<WorkbenchChoice>('keep');
  readonly onWorkbenchCount = computed(() => this.minis().filter((mini) => mini.isOnWorkbench).length);
  /** How many minis "Put on" leaves off the workbench; none for the other choices. */
  readonly workbenchRefusals = computed(() =>
    this.workbench() === 'put-on' ? workbenchRefusals(this.minis(), this.status()) : 0,
  );

  // Factions
  private readonly addedFactions = signal<readonly FactionDraft[]>([]);
  private readonly removedFactionIds = signal<ReadonlySet<string>>(new Set());
  /** The names of the factions given here; the hoard knows only those its minis and boxes have. */
  private readonly addedFactionNames = signal<ReadonlyMap<string, string>>(new Map());

  /** Those the minis carry first, then those to be added. */
  readonly factions = computed((): FactionChip[] => {
    const names = this.factionNames.names();
    const added = this.addedFactions();
    const carried = factionShares(this.minis()).map(({ id, count }) => ({
      id,
      name: this.addedFactionNames().get(id) ?? names.get(id) ?? id,
      isOwn: isOwnFaction(id),
      count,
      mark: this.markOf(
        this.removedFactionIds().has(id),
        added.some((faction) => faction.id === id),
      ),
    }));
    const fresh = added
      .filter((faction) => !carried.some((chip) => chip.id !== undefined && chip.id === faction.id))
      .map((faction) => ({ ...faction, isOwn: isOwnDraft(faction), count: 0, mark: 'added' as const }));
    return [...carried, ...fresh];
  });
  /** The factions every mini will carry, which the search does not offer again. */
  readonly fullFactionIds = computed(() =>
    this.factions().flatMap((chip) =>
      chip.id !== undefined && chip.mark !== 'removed' && (chip.mark === 'added' || chip.count === this.count())
        ? [chip.id]
        : [],
    ),
  );

  // Parts
  /** Parts to put on every mini, by id, glued or swappable; also ones some minis carry already. */
  private readonly chosenParts = signal<ReadonlyMap<string, boolean>>(new Map());
  private readonly newParts = signal<readonly NewPart[]>([]);
  private readonly removedPartIds = signal<ReadonlySet<string>>(new Set());

  /** Those the minis carry first, then those to be added. */
  readonly parts = computed((): PartTile[] => {
    const names = this.partsStore.names();
    const chosen = this.chosenParts();
    const carried = partShares(this.minis()).map(({ partId, count, carried }) => {
      const isSwappable = chosen.get(partId);
      return {
        partId,
        name: names.get(partId) ?? '',
        count,
        carried: isSwappable === undefined ? carried : swappableOrGlued(isSwappable),
        // Choosing glued or swappable puts the part on those minis that lack it as well.
        mark: this.markOf(this.removedPartIds().has(partId), isSwappable !== undefined && count < this.count()),
      };
    });
    const fresh = this.newParts().map((part) => ({
      ...part,
      count: 0,
      carried: swappableOrGlued(part.isSwappable),
      mark: 'added' as const,
    }));
    return [...carried, ...fresh];
  });

  /** The ids of the minis' factions, for the parts of their range. */
  private readonly factionIds = computed(() => factionShares(this.minis()).map(({ id }) => id));
  private readonly rangeParts = resource({
    params: () => {
      const factionIds = this.factionIds();
      return factionIds.length > 0 ? { factionIds } : undefined;
    },
    loader: ({ params: { factionIds } }) => this.catalogParts.rangeParts(factionIds),
  });
  /** What the part picker offers parts from; the minis have no kit of their own here. */
  readonly partSource = computed(() => ({
    vocabulary: this.partsStore.parts(),
    range: this.rangeParts.hasValue() ? this.rangeParts.value() : [],
    carried: this.parts()
      .filter((tile) => tile.mark === 'added' || (tile.mark === 'kept' && tile.count === this.count()))
      .map((tile) => tile.name),
  }));
  /** Named after the minis' first faction, e.g. "Orks" for "Orks range". */
  readonly rangeName = computed(() => this.factions()[0]?.name);

  // The changes
  readonly changes = computed((): ChangesToSelectedMinis => {
    const status = this.status();
    const workbench = this.workbench();
    const addFactions = this.addedFactions().map(toFactionChange);
    const removeFactionIds = [...this.removedFactionIds()];
    const addParts = [
      ...[...this.chosenParts()].map(([partId, isSwappable]) => ({ partId, isSwappable })),
      ...this.newParts().map(({ partId, name, isSwappable }) =>
        partId === undefined ? { name, isSwappable } : { partId, isSwappable },
      ),
    ];
    const removePartIds = [...this.removedPartIds()];
    return {
      ...(status === undefined ? {} : { status }),
      ...(workbench === 'keep' ? {} : { workbench }),
      ...(addFactions.length === 0 ? {} : { addFactions }),
      ...(removeFactionIds.length === 0 ? {} : { removeFactionIds }),
      ...(addParts.length === 0 ? {} : { addParts }),
      ...(removePartIds.length === 0 ? {} : { removePartIds }),
    };
  });
  readonly hasChanges = computed(() => Object.keys(this.changes()).length > 0);
  /** E.g. "Status and 1 part change on 5 minis." */
  readonly summary = computed(() => changesSummary(this.changes(), this.count()));

  readonly isApplying = signal(false);
  readonly hasApplyFailed = signal(false);

  /** Choosing the status the minis share keeps it. */
  chooseStatus(status: HobbyStatus): void {
    this.status.set(status === sharedStatus(this.minis()) ? undefined : status);
  }

  /** Gives every mini the faction; one some of them carry, or one to be removed, as well. */
  addFaction({ id, name }: { readonly id: string; readonly name: string }): void {
    this.addedFactionNames.update((names) => new Map([...names, [id, name]]));
    this.undoRemovingFaction(id);
    if (!hasFaction(this.addedFactions(), { id, name })) {
      this.addedFactions.update((factions) => [...factions, { id, name }]);
    }
  }

  /** Gives every mini a new own faction of that name, created once the changes are applied. */
  createFaction(name: string): void {
    if (!hasFaction(this.addedFactions(), { name })) {
      this.addedFactions.update((factions) => [...factions, { name }]);
    }
  }

  /** Removes a faction the minis carry from all of them, or takes back adding one. */
  removeFaction(chip: FactionChip): void {
    if (chip.mark === 'added') {
      this.addedFactions.update((factions) => factions.filter((faction) => !isSameFaction(faction, chip)));
      return;
    }
    if (chip.id !== undefined) {
      const { id } = chip;
      this.removedFactionIds.update((ids) => new Set([...ids, id]));
    }
  }

  undoRemovingFaction(id: string): void {
    this.removedFactionIds.update((ids) => new Set([...ids].filter((removed) => removed !== id)));
  }

  /** Puts a part the picker offers, or a new one by name, glued on every mini. */
  addPart(part: PartOption | string): void {
    const { partId, name } = typeof part === 'string' ? { partId: undefined, name: part } : part;
    if (partId !== undefined && this.parts().some((tile) => tile.partId === partId && tile.count > 0)) {
      this.undoRemovingPart(partId);
      this.chosenParts.update((chosen) => new Map([...chosen, [partId, false]]));
      return;
    }
    this.newParts.update((parts) => [...parts, { partId, name, isSwappable: false }]);
  }

  /** Removes a part the minis carry from all of them, or takes back adding one. */
  removePart(tile: PartTile): void {
    const { partId } = tile;
    if (tile.count === 0) {
      this.newParts.update((parts) => parts.filter((part) => part.name !== tile.name));
      return;
    }
    if (partId === undefined) {
      return;
    }
    if (tile.mark === 'added') {
      this.chosenParts.update((chosen) => new Map([...chosen].filter(([id]) => id !== partId)));
      return;
    }
    this.removedPartIds.update((ids) => new Set([...ids, partId]));
  }

  undoRemovingPart(partId: string): void {
    this.removedPartIds.update((ids) => new Set([...ids].filter((removed) => removed !== partId)));
  }

  /** Glued becomes swappable and back; mixed becomes swappable. */
  toggleSwappable(tile: PartTile): void {
    const isSwappable = tile.carried !== 'swappable';
    if (tile.count === 0) {
      this.newParts.update((parts) => parts.map((part) => (part.name === tile.name ? { ...part, isSwappable } : part)));
      return;
    }
    const { partId } = tile;
    if (partId === undefined) {
      return;
    }
    const share = partShares(this.minis()).find((carried) => carried.partId === partId);
    const isAsCarried = share?.count === this.count() && share.carried === swappableOrGlued(isSwappable);
    this.chosenParts.update(
      (chosen) =>
        new Map(isAsCarried ? [...chosen].filter(([id]) => id !== partId) : [...chosen, [partId, isSwappable]]),
    );
  }

  /**
   * Applies the changes to every selected mini at once; when the server does not apply them,
   * every change stays.
   *
   * @returns whether they are applied
   */
  async apply(): Promise<boolean> {
    this.isApplying.set(true);
    this.hasApplyFailed.set(false);
    try {
      const changed = await this.adapter.change(
        this.minis().map((mini) => mini.id),
        this.changes(),
      );
      this.hoardChanges.changed(changed);
      return true;
    } catch {
      this.hasApplyFailed.set(true);
      return false;
    } finally {
      this.isApplying.set(false);
    }
  }

  private markOf(isRemoved: boolean, isAdded: boolean): ChangeMark {
    if (isRemoved) {
      return 'removed';
    }
    return isAdded ? 'added' : 'kept';
  }
}

function swappableOrGlued(isSwappable: boolean): 'glued' | 'swappable' {
  return isSwappable ? 'swappable' : 'glued';
}

function isSameFaction(faction: FactionDraft, chip: FactionChip): boolean {
  return chip.id === undefined ? faction.id === undefined && faction.name === chip.name : faction.id === chip.id;
}
