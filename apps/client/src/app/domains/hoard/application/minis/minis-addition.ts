import { computed, inject, Injectable, resource, signal } from '@angular/core';
import type { HobbyStatus } from '@greyhoarder/domain/hoard';
import { HttpCatalogPartsAdapter } from '../../../catalog/api';
import { MinisStore } from '../../data/minis-store';
import { PartsStore } from '../../data/parts-store';
import { HttpMinisAdapter } from '../../infrastructure/http-minis-adapter';
import { type FactionDraft, hasFaction, idsOf, toFactionChange } from '../../models/faction-draft';
import type { PartChange } from '../../models/mini-changes';
import { type KitVersion, MIN_MINIS, type MinisToAdd } from '../../models/minis-to-add';
import type { PartOption } from '../../models/part-options';
import { suggestionKit } from './suggestion-kit';
import { minisLabel } from '../../util/kit-labels';
import { STATUS_LABELS } from '../../util/status-labels';
import type { PartDraft } from './mini-editor';

/** What a new form starts with. */
export interface AdditionStart {
  readonly name?: string;
  readonly faction?: FactionDraft;
  /** The parts the catalog suggests for the name; offered first by the part picker. */
  readonly suggestedParts?: readonly string[];
  /** The catalog kit the minis come from. */
  readonly kit?: KitVersion;
}

/**
 * Adding alike minis without a box, from the catalog or put together by the user: their name,
 * factions, status, parts, notes and how many, and adding them again in another state
 * (docs/screens/add-minis.md, docs/screens/add-custom.md). Provided by each of these pages.
 */
@Injectable()
export class MinisAddition {
  private readonly minisAdapter = inject(HttpMinisAdapter);
  private readonly minisStore = inject(MinisStore);
  private readonly partsStore = inject(PartsStore);
  private readonly catalogParts = inject(HttpCatalogPartsAdapter);

  readonly name = signal('');
  /** Also new own factions, which have no id until the minis are added. */
  readonly factions = signal<readonly FactionDraft[]>([]);
  private readonly factionIds = computed(() => idsOf(this.factions()));
  /** Named after the first faction, e.g. "Orks" for "Orks range". */
  readonly rangeName = computed(() => this.factions()[0]?.name);
  readonly status = signal<HobbyStatus>('built');
  readonly count = signal(MIN_MINIS);
  readonly parts = signal<readonly PartDraft[]>([]);
  readonly notes = signal('');
  readonly isPickerOpen = signal(false);
  private readonly suggestedParts = signal<readonly string[]>([]);
  private readonly kit = signal<KitVersion | undefined>(undefined);

  readonly isAdding = signal(false);
  readonly hasAddFailed = signal(false);
  /** What was added last, for the status bar. */
  readonly added = signal<string | undefined>(undefined);

  /** The parts of the catalog kits of the factions and those they are part of. */
  private readonly rangeParts = resource({
    params: () => {
      const factionIds = this.factionIds();
      return factionIds.length > 0 ? { factionIds } : undefined;
    },
    loader: ({ params: { factionIds } }) => this.catalogParts.rangeParts(factionIds),
  });
  /** What the part picker offers parts from, but the filter text. */
  readonly partSource = computed(() => ({
    kit: suggestionKit(this.name(), this.suggestedParts()),
    sprueName: this.name(),
    vocabulary: this.partsStore.parts(),
    range: this.rangeParts.hasValue() ? this.rangeParts.value() : [],
    carried: this.parts().map((part) => part.name),
  }));
  /** The label of the add button, e.g. "Add 3 minis". */
  readonly addLabel = computed(() => `Add ${minisLabel(this.count())}`);

  /** A new form: one built mini, no parts and no notes; the status bar stays. */
  start(start: AdditionStart = {}): void {
    this.name.set(start.name ?? '');
    this.factions.set(start.faction ? [start.faction] : []);
    this.suggestedParts.set(start.suggestedParts ?? []);
    this.kit.set(start.kit);
    this.status.set('built');
    this.count.set(MIN_MINIS);
    this.parts.set([]);
    this.notes.set('');
    this.isPickerOpen.set(false);
    this.hasAddFailed.set(false);
  }

  /** A faction found, or a new own faction by its name; the server adds that with the minis. */
  addFaction(faction: FactionDraft): void {
    this.factions.update((factions) =>
      hasFaction(factions, faction) ? factions : [...factions, faction],
    );
  }

  removeFaction(index: number): void {
    this.factions.update((factions) => factions.filter((_, other) => other !== index));
  }

  changeCount(by: number): void {
    this.count.update((count) => Math.max(MIN_MINIS, count + by));
  }

  togglePicker(): void {
    this.isPickerOpen.update((isOpen) => !isOpen);
  }

  /** Adds a part the picker offers, or a new one by name, as glued. */
  addPart(part: PartOption | string): void {
    const draft: PartDraft =
      typeof part === 'string'
        ? { name: part, isSwappable: false }
        : { partId: part.partId, name: part.name, isSwappable: false };
    this.parts.update((parts) => [...parts, draft]);
  }

  removePart(index: number): void {
    this.parts.update((parts) => parts.filter((_, other) => other !== index));
  }

  toggleSwappable(index: number): void {
    this.parts.update((parts) =>
      parts.map((part, other) =>
        other === index ? { ...part, isSwappable: !part.isSwappable } : part,
      ),
    );
  }

  /**
   * The server adds the minis; the hoard is loaded again afterwards. The form keeps what was
   * chosen, so the same minis can be added again in another state. Failing shows in
   * `hasAddFailed`.
   */
  async add(): Promise<void> {
    if (this.isAdding()) {
      return;
    }
    // Taken before the request, so changes made while it runs don't change what is reported.
    const minis = this.minisToAdd();
    this.added.set(undefined);
    this.hasAddFailed.set(false);
    this.isAdding.set(true);
    try {
      await this.minisAdapter.add(minis);
    } catch {
      // The form keeps what was chosen, so the user can try again.
      this.hasAddFailed.set(true);
      return;
    } finally {
      this.isAdding.set(false);
    }
    this.reloadHoard(minis);
    this.added.set(addedMessage(minis));
  }

  private minisToAdd(): MinisToAdd {
    const notes = this.notes().trim();
    const kit = this.kit();
    return {
      ...(kit === undefined ? {} : { kit }),
      name: this.name().trim(),
      factions: this.factions().map(toFactionChange),
      status: this.status(),
      parts: this.parts().map(toPartChange),
      ...(notes === '' ? {} : { notes }),
      count: this.count(),
    };
  }

  /** The vocabulary loads anew only when parts were added to it by name. */
  private reloadHoard(minis: MinisToAdd): void {
    this.minisStore.reload();
    if (minis.parts.some((part) => !('partId' in part))) {
      this.partsStore.reload();
    }
  }
}

/** A new part goes by its name, which the server finds in the vocabulary or adds to it. */
function toPartChange(part: PartDraft): PartChange {
  return part.partId === undefined
    ? { name: part.name, isSwappable: part.isSwappable }
    : { partId: part.partId, isSwappable: part.isSwappable };
}

/** E.g. "Added 3 × Boy (Built) to your hoard." */
function addedMessage(minis: MinisToAdd): string {
  return `Added ${minis.count} × ${minis.name} (${STATUS_LABELS[minis.status]}) to your hoard.`;
}
