import {
  hasReached,
  type HobbyStatus,
  type Kit,
  type Mini,
  type MiniPart,
} from '@greyhoarder/domain/hoard';
import { slotsOf } from './kit-slots';

// Building minis that were on the sprue (docs/screens/mini.md).

/** A name the kit of a box suggests, and how many minis of the box are left for it. */
export interface BuildSuggestion {
  readonly name: string;
  readonly left: number;
}

/**
 * Every name the slots of all variants of the kit suggest, kits in it included, each once in the
 * kit's order. A name is left as often as the kit provides it (in the variant that provides the
 * most) minus the minis of the box that used it up: those built as it, and those built under a
 * name of the user's own that had it on the sprue.
 */
export function buildSuggestions(kit: Kit, minisOfBox: readonly Mini[]): BuildSuggestion[] {
  const names = [...new Set(slotsOf(kit).flatMap((slot) => slot.names))];
  return names.map((name) => {
    const usedUp = minisOfBox.filter(
      (mini) =>
        mini.status !== 'sprue' &&
        (mini.name === name || (!names.includes(mini.name) && mini.sprueName === name)),
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
  const slots = kit ? slotsOf(kit).filter((slot) => slot.names.includes(name)) : [];
  const parts = [...new Set(slots.flatMap((slot) => slot.parts))];
  return parts.length === 1 ? parts : [];
}

/** The status built minis get: the one chosen on the sprue, but at least built. */
export function buildStatus(chosen: HobbyStatus): HobbyStatus {
  return hasReached(chosen, 'built') ? chosen : 'built';
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
