import type { BoxRow } from './box-row';
import type { KitOption } from './kit-option';

/** E.g. "Games Workshop · 50-80"; the year goes with the name. */
export function kitMeta(kit: KitOption): string {
  return [kit.manufacturer, kit.sku]
    .filter((part) => part !== undefined && part !== '')
    .join(' · ');
}

/** "1 mini" or "{n} minis". */
export function minisLabel(count: number): string {
  return count === 1 ? '1 mini' : `${count} minis`;
}

/**
 * How many minis the kit yields: "1 mini", "10 minis", and for either-or kits
 * whose variants differ "5 or 10 minis" (variants of the same size count once).
 */
export function kitMinis(kit: KitOption): string {
  const counts = [...new Set(kit.variants.map((variant) => variant.minis))].sort((a, b) => a - b);
  const last = counts.at(-1) ?? kit.minis;
  if (counts.length <= 1) {
    return minisLabel(last);
  }
  return `${counts.slice(0, -1).join(', ')} or ${last} minis`;
}

/** Minis of one kind that a new box puts on the sprue. */
export interface SprueMinis {
  readonly count: number;
  readonly name: string;
  /** Empty for the kit's first faction. */
  readonly factions: readonly string[];
  /** What they can be built as, the most common build first. */
  readonly builds: readonly string[];
  readonly parts: readonly string[];
  /** Minis of an either-or kit: what each becomes is decided when it is built. */
  readonly isUndecided: boolean;
}

/**
 * The minis a new box of the kit puts on the sprue, without asking what will be built
 * (docs/domains/hoard.md): the slots of a kit with one variant; for an either-or kit as many
 * as it yields, named after the kit, that can become what any of its variants suggests.
 */
export function sprueMinis(kit: KitOption): SprueMinis[] {
  if (kit.variants.length > 1) {
    const builds = new Set(
      kit.variants.flatMap((variant) => variant.slots.flatMap((slot) => slot.names)),
    );
    return [
      {
        count: kit.minis,
        name: kit.name,
        factions: [],
        builds: [...builds],
        parts: [],
        isUndecided: true,
      },
    ];
  }
  return (kit.variants[0]?.slots ?? []).map((slot) => ({
    count: slot.count,
    name: slot.names[0] ?? kit.name,
    factions: slot.factions,
    builds: slot.names,
    parts: slot.parts,
    isUndecided: false,
  }));
}

/** The name a box of the kit gets, with its edition: "Boyz (2026)". */
export function boxKitName(kit: KitOption): string {
  return kit.year === undefined ? kit.name : `${kit.name} (${kit.year})`;
}

/** A box is of the kit when its name and release match: the product code if both have one, else the name. */
export function isBoxOfKit(box: BoxRow, kit: KitOption): boolean {
  if (!box.kit) {
    return false;
  }
  if (box.kit.sku !== undefined && kit.sku !== undefined) {
    return box.kit.sku === kit.sku;
  }
  return box.kit.name === boxKitName(kit);
}
