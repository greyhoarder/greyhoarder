import { type Kit, type KitSlot, kitName } from './kit.js';

/** Minis of one kind that a new box puts on the sprue. */
export interface SprueMinis {
  readonly count: number;
  readonly name: string;
  /** Empty for the kit's first faction. */
  readonly factionIds: readonly string[];
  /** What they can be built as, the most common build first. */
  readonly builds: readonly string[];
  readonly parts: readonly string[];
  /** Minis of an either-or kit: what each becomes is decided when it is built. */
  readonly isUndecided: boolean;
}

/**
 * The minis a new box of the kit puts on the sprue, without asking what will be built
 * (docs/domains/hoard.md): the slots of a kit with one variant; for an either-or kit the slots
 * every variant has, and the rest named after the kit, able to become what any variant
 * suggests; for a bundle also those of every kit it contains, as often as it comes in the box.
 */
export function sprueMinis(kit: Kit): SprueMinis[] {
  return [
    ...ownSprueMinis(kit),
    ...kit.contains.flatMap(({ kit: contained, count }) =>
      sprueMinis(contained).map((minis) => ({
        ...minis,
        count: minis.count * count,
        factionIds: minis.factionIds.length > 0 ? minis.factionIds : contained.factionIds.slice(0, 1),
      })),
    ),
  ];
}

/** Minis of the kit's own variants, without those of the kits it contains. */
function ownSprueMinis(kit: Kit): SprueMinis[] {
  if (kit.variants.length > 1) {
    return eitherOrSprueMinis(kit);
  }
  return (kit.variants[0]?.slots ?? []).map((slot) => slotSprueMinis(kit, slot));
}

/**
 * A slot that every variant has, like the Spanner of Lootas and Burna Boyz, is decided
 * already; only the other minis are named after the kit and can become any outcome.
 */
function eitherOrSprueMinis(kit: Kit): SprueMinis[] {
  const [first, ...others] = kit.variants;
  const sharedSlots = (first?.slots ?? []).filter((slot) =>
    others.every((variant) => variant.slots.some((other) => isSameSlot(slot, other))),
  );
  const undecidedSlots = kit.variants.flatMap((variant) =>
    variant.slots.filter((slot) => !sharedSlots.some((shared) => isSameSlot(slot, shared))),
  );
  const sharedMinis = sharedSlots.reduce((sum, slot) => sum + slot.count, 0);
  const undecided: SprueMinis = {
    count: kit.minis - containedMinis(kit) - sharedMinis,
    name: kitName(kit),
    factionIds: [],
    builds: [...new Set(undecidedSlots.flatMap((slot) => slot.names))],
    parts: [...new Set(undecidedSlots.flatMap((slot) => slot.parts))],
    isUndecided: true,
  };
  return [...(undecided.count > 0 ? [undecided] : []), ...sharedSlots.map((slot) => slotSprueMinis(kit, slot))];
}

function slotSprueMinis(kit: Kit, slot: KitSlot): SprueMinis {
  return {
    count: slot.count,
    name: slot.names[0] ?? kit.name,
    factionIds: slot.factionIds,
    builds: slot.names,
    parts: slot.parts,
    isUndecided: false,
  };
}

function isSameSlot(slot: KitSlot, other: KitSlot): boolean {
  const sameList = (a: readonly string[], b: readonly string[]) => a.join('\n') === b.join('\n');
  return (
    slot.count === other.count &&
    sameList(slot.names, other.names) &&
    sameList(slot.parts, other.parts) &&
    sameList(slot.factionIds, other.factionIds)
  );
}

function containedMinis(kit: Kit): number {
  return kit.contains.reduce((sum, contained) => sum + contained.kit.minis * contained.count, 0);
}
