import { type CatalogKit, type KitSlot, oldestYear } from '@greyhoarder/domain/catalog';

/** A kit a catalog mini comes from. */
export interface CatalogMiniKit {
  readonly id: string;
  readonly name: string;
  /** The year of its oldest release, if known. */
  readonly year?: number;
  readonly isDraft: boolean;
}

/** A name slots of catalog kits can be built as, for one faction (docs/domains/catalog.md). */
export interface CatalogMini {
  readonly name: string;
  /** Left out for minis of kits without a game system. */
  readonly factionId?: string;
  /** What the slots offer, each once, in the order they first come. */
  readonly parts: readonly string[];
  readonly kits: readonly CatalogMiniKit[];
}

/** One name of one slot for one faction, before minis of the same name and faction are merged. */
interface SlotMini {
  readonly name: string;
  readonly factionId?: string;
  readonly parts: readonly string[];
  readonly kit: CatalogMiniKit;
}

/** One word of a search for minis, with the factions whose name contains it. */
export interface MiniSearchWord {
  readonly text: string;
  readonly factionIds: readonly string[];
}

/**
 * The minis of the kits for which every word is in their name, the kit's name or the name of their
 * faction, ignoring case: one per name and faction, whatever kit it comes from; in the order they
 * first come.
 */
export function catalogMinisOf(kits: readonly CatalogKit[], words: readonly MiniSearchWord[]): CatalogMini[] {
  const needles = words.map((word) => ({ text: word.text.toLowerCase(), factionIds: new Set(word.factionIds) }));
  return mergeByNameAndFaction(kits.flatMap((kit) => matchingSlotMinis(kit, needles)));
}

/**
 * How well the mini matches the words, higher first: per word 4 when a word of its name starts with
 * it, 3 when its name contains it, 2 when it is its faction's, 1 when only a kit's name contains it.
 */
export function relevanceOf(mini: CatalogMini, words: readonly MiniSearchWord[]): number {
  const name = mini.name.toLowerCase();
  const nameWords = name.split(/\s+/);
  return words.reduce((sum, word) => {
    const text = word.text.toLowerCase();
    const score = nameWords.some((nameWord) => nameWord.startsWith(text))
      ? 4
      : name.includes(text)
        ? 3
        : mini.factionId !== undefined && word.factionIds.includes(mini.factionId)
          ? 2
          : 1;
    return sum + score;
  }, 0);
}

/** Every name of the kit's slots for each faction that matches every word. */
function matchingSlotMinis(
  kit: CatalogKit,
  needles: readonly { readonly text: string; readonly factionIds: ReadonlySet<string> }[],
): SlotMini[] {
  const kitName = kit.name.toLowerCase();
  return kit.variants
    .flatMap((variant) => variant.slots)
    .flatMap((slot) => slotMinis(kit, slot))
    .filter((mini) =>
      needles.every(
        (needle) =>
          kitName.includes(needle.text) ||
          mini.name.toLowerCase().includes(needle.text) ||
          (mini.factionId !== undefined && needle.factionIds.has(mini.factionId)),
      ),
    );
}

/** The slot's names for the slot's factions, or else for each of its kit's; without any, for none. */
function slotMinis(kit: CatalogKit, slot: KitSlot): SlotMini[] {
  const factionIds = slot.factionIds.length > 0 ? slot.factionIds : kit.factionIds;
  const factions = factionIds.length > 0 ? factionIds : [undefined];
  const miniKit = miniKitOf(kit);
  return slot.buildsAs.flatMap((name) =>
    factions.map((factionId) => ({ name, factionId, parts: slot.parts, kit: miniKit })),
  );
}

/** The same name, ignoring case, for the same faction is one mini with the parts and kits of all. */
function mergeByNameAndFaction(slotMinis: readonly SlotMini[]): CatalogMini[] {
  const byKey = new Map<string, CatalogMini>();
  for (const { kit, ...slotMini } of slotMinis) {
    const key = `${slotMini.name.toLowerCase()}\n${slotMini.factionId ?? ''}`;
    const known = byKey.get(key);
    byKey.set(key, known ? merged(known, slotMini.parts, kit) : withoutFaction({ ...slotMini, kits: [kit] }));
  }
  return [...byKey.values()];
}

function merged(mini: CatalogMini, parts: readonly string[], kit: CatalogMiniKit): CatalogMini {
  return {
    ...mini,
    parts: [...new Set([...mini.parts, ...parts])],
    kits: mini.kits.some((known) => known.id === kit.id) ? mini.kits : [...mini.kits, kit],
  };
}

/** Leaves the faction out instead of setting it to undefined. */
function withoutFaction(mini: CatalogMini): CatalogMini {
  const { factionId, ...rest } = mini;
  return factionId === undefined ? rest : mini;
}

function miniKitOf(kit: CatalogKit): CatalogMiniKit {
  const year = oldestYear(kit);
  const kitOf = { id: kit.id, name: kit.name, isDraft: kit.isDraft };
  return year === undefined ? kitOf : { ...kitOf, year };
}
