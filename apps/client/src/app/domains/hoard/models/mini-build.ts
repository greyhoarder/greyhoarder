import { type Kit, type Mini, type MiniPart, sprueMinis } from '@greyhoarder/domain/hoard';
import { slotsOf, sprueOffer } from './kit-slots';

// Building minis that were on the sprue (docs/screens/mini.md).

/** A name the kit of a box suggests, and how many minis of the box are left for it. */
export interface BuildSuggestion {
  readonly name: string;
  readonly left: number;
}

/**
 * What minis with the sprue name can be built as: the names their slot suggests, each once in the
 * kit's order; without a slot of that sprue name, every name the kit suggests, kits in it included.
 * A name is left as often as the kit provides it (in the variant that provides the most) minus the
 * minis of the box that used it up: those built as it, and those built under a name of the user's
 * own that had it on the sprue, and those built from a slot that offered it: the names of an
 * either-or slot share its minis, so building a Loota leaves one Burna Boy fewer as well.
 */
export function buildSuggestions(
  kit: Kit,
  minisOfBox: readonly Mini[],
  sprueName?: string,
): BuildSuggestion[] {
  const allNames = [...new Set(slotsOf(kit).flatMap((slot) => slot.names))];
  const kinds = sprueMinis(kit);
  /** What the kit put minis with this sprue name on the sprue to be built as; none for other names. */
  const offeredBy = (sprueName: string | undefined): readonly string[] =>
    kinds.filter((kind) => kind.name === sprueName).flatMap((kind) => kind.builds);
  return sprueOffer(kit, sprueName).names.map((name) => {
    const usedUp = minisOfBox.filter(
      (mini) =>
        mini.status !== 'sprue' &&
        (mini.name === name ||
          (!allNames.includes(mini.name) && mini.sprueName === name) ||
          offeredBy(mini.sprueName).includes(name)),
    ).length;
    return { name, left: Math.max(0, provided(kit, name) - usedUp) };
  });
}

/**
 * The parts to preselect for a name: those of the mini most recently built as it, from the minis in
 * the order they were last changed; without one, the part the kit's slots for the name offer when
 * they offer exactly one, by name; else none.
 */
export function preselectedParts(
  minis: readonly Mini[],
  kit: Kit | undefined,
  name: string,
): readonly MiniPart[] | readonly string[] {
  const latest = [...minis].reverse().find((mini) => mini.status !== 'sprue' && mini.name === name);
  if (latest) {
    return latest.parts;
  }
  const parts = kit ? kitParts(kit, name) : [];
  return parts.length === 1 ? parts : [];
}

/** The parts the kit's slots for a name offer, each once in the kit's order. */
export function kitParts(kit: Kit, name: string): string[] {
  const slots = slotsOf(kit).filter((slot) => slot.names.includes(name));
  return [...new Set(slots.flatMap((slot) => slot.parts))];
}

/** How many minis a box of the kit provides for a name: in the variant that provides the most, plus the kits in it. */
function provided(kit: Kit, name: string): number {
  const ownMinis = Math.max(
    0,
    ...kit.variants.map((variant) =>
      variant.slots
        .filter((slot) => slot.names.includes(name))
        .reduce((sum, slot) => sum + slot.count, 0),
    ),
  );
  return kit.contains.reduce(
    (sum, { kit: contained, count }) => sum + count * provided(contained, name),
    ownMinis,
  );
}
