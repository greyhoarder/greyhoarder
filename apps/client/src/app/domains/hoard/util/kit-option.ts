import type { CatalogKit } from '@greyhoarder/domain/catalog';

/** A slot of a kit's variant: how many minis, what they can be built as, which parts come with them. */
export interface KitOptionSlot {
  readonly count: number;
  /** Suggested names, the most common build first. */
  readonly names: readonly string[];
  readonly parts: readonly string[];
  /** Faction names of the slot; empty when it belongs to the kit's factions. */
  readonly factions: readonly string[];
}

/** One either-or outcome of a kit. */
export interface KitOptionVariant {
  readonly name: string;
  readonly slots: readonly KitOptionSlot[];
  /** Minis a box yields with this variant. */
  readonly minis: number;
}

/** A kit that a new box can be added from, as offered when searching for it. */
export interface KitOption {
  /** For catalog kits their path in the catalog, e.g. "games-workshop/orks/boyz-2026". */
  readonly id: string;
  readonly name: string;
  /** The kit's name and those of its other either-or variants: "Lootas", "Burna Boyz". */
  readonly names: readonly string[];
  readonly manufacturer: string;
  readonly factions: readonly string[];
  /** The year the kit first went on sale: that of its oldest release, if known. */
  readonly year?: number;
  /** The manufacturer's product code, e.g. "50-80", if the kit has one. */
  readonly sku?: string;
  /** Not yet checked against a physical box. */
  readonly isDraft: boolean;
  /** In the kit's order; empty for kits without slots. */
  readonly variants: readonly KitOptionVariant[];
  /** Minis a box yields when the kit has no variants. */
  readonly minis: number;
}

/** A catalog kit as offered; factions without a known name are left out. */
export function toKitOption(kit: CatalogKit, factionNames: ReadonlyMap<string, string>): KitOption {
  const namesOf = (ids: readonly string[]) => ids.flatMap((id) => factionNames.get(id) ?? []);
  // `minis` counts the first variant together with the contained kits, which every variant shares.
  const slotMinis = (variant: CatalogKit['variants'][number]) =>
    variant.slots.reduce((sum, slot) => sum + slot.count, 0);
  const firstVariant = kit.variants[0];
  const contained = firstVariant ? kit.minis - slotMinis(firstVariant) : 0;
  return {
    id: kit.id,
    name: kit.name,
    names: [...new Set([kit.name, ...kit.variants.map((variant) => variant.name)])],
    manufacturer: manufacturerName(kit.manufacturer),
    factions: namesOf(kit.factionIds),
    year: kit.releases.find((release) => release.year !== undefined)?.year,
    sku: kit.releases.find((release) => release.sku !== undefined)?.sku,
    isDraft: kit.isDraft,
    variants: kit.variants.map((variant) => ({
      name: variant.name,
      slots: variant.slots.map((slot) => ({
        count: slot.count,
        names: slot.buildsAs,
        parts: slot.parts,
        factions: namesOf(slot.factionIds),
      })),
      minis: slotMinis(variant) + contained,
    })),
    minis: kit.minis,
  };
}

/** The catalog names manufacturers only by their folder, e.g. "games-workshop" → "Games Workshop". */
function manufacturerName(folder: string): string {
  return folder
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
