import { type Kit, kitName } from './kit';

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
 * (docs/domains/hoard.md): the slots of a kit with one variant; for an either-or kit as many
 * as it yields, named after the kit, that can become what any of its variants suggests; for a
 * bundle also those of every kit it contains, as often as it comes in the box.
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
    const builds = new Set(
      kit.variants.flatMap((variant) => variant.slots.flatMap((slot) => slot.names)),
    );
    const parts = new Set(
      kit.variants.flatMap((variant) => variant.slots.flatMap((slot) => slot.parts)),
    );
    return [
      {
        count: kit.minis - containedMinis(kit),
        name: kitName(kit),
        factionIds: [],
        builds: [...builds],
        parts: [...parts],
        isUndecided: true,
      },
    ];
  }
  return (kit.variants[0]?.slots ?? []).map((slot) => ({
    count: slot.count,
    name: slot.names[0] ?? kit.name,
    factionIds: slot.factionIds,
    builds: slot.names,
    parts: slot.parts,
    isUndecided: false,
  }));
}

function containedMinis(kit: Kit): number {
  return kit.contains.reduce((sum, contained) => sum + contained.kit.minis * contained.count, 0);
}
