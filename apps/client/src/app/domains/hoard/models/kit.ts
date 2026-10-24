import type { CatalogKit } from '@greyhoarder/domain/catalog';

/** A slot of a kit's variant: how many minis, what they can be built as, which parts come with them. */
export interface KitSlot {
  readonly count: number;
  /** Suggested names, the most common build first. */
  readonly names: readonly string[];
  readonly parts: readonly string[];
  /** Factions of the slot; empty when it belongs to the kit's factions. */
  readonly factionIds: readonly string[];
}

/** One either-or outcome of a kit. */
export interface KitVariant {
  readonly name: string;
  readonly slots: readonly KitSlot[];
  /** Minis a box yields with this variant. */
  readonly minis: number;
}

/** Kits a bundle contains, each as many times as it comes in the box. */
export interface BundledKit {
  readonly kit: Kit;
  readonly count: number;
}

/** A kit that a new box can be added from, as offered when searching for it. */
export interface Kit {
  /** For catalog kits their path in the catalog, e.g. "games-workshop/orks/boyz-2026". */
  readonly id: string;
  /** Which version of the kit a box added from it is made from. */
  readonly version: number;
  readonly name: string;
  /** The kit's name and those of its other either-or variants: "Lootas", "Burna Boyz". */
  readonly names: readonly string[];
  /** As the catalog names it, e.g. "games-workshop". */
  readonly manufacturer: string;
  /** The first one is the army the kit is mainly sold for. */
  readonly factionIds: readonly string[];
  /** The year the kit first went on sale: that of its oldest release, if known. */
  readonly year?: number;
  /** The manufacturer's product code, e.g. "50-80", if the kit has one. */
  readonly sku?: string;
  /** Not yet checked against a physical box. */
  readonly isDraft: boolean;
  /** In the kit's order; empty for kits without slots. */
  readonly variants: readonly KitVariant[];
  /** Minis a box yields with the first variant, together with those of the contained kits. */
  readonly minis: number;
  /** For bundles; empty for kits that contain no other kits. */
  readonly contains: readonly BundledKit[];
}

/** A catalog kit as the hoard knows it; contained kits the catalog does not know are left out. */
export function toKit(
  kit: CatalogKit & { readonly version: number },
  containedKits: ReadonlyMap<string, CatalogKit & { readonly version: number }>,
): Kit {
  // `minis` counts the first variant together with the contained kits, which every variant shares.
  const slotMinis = (variant: CatalogKit['variants'][number]) =>
    variant.slots.reduce((sum, slot) => sum + slot.count, 0);
  const firstVariant = kit.variants[0];
  const contained = firstVariant ? kit.minis - slotMinis(firstVariant) : 0;
  return {
    id: kit.id,
    version: kit.version,
    name: kit.name,
    names: [...new Set([kit.name, ...kit.variants.map((variant) => variant.name)])],
    manufacturer: kit.manufacturer,
    factionIds: kit.factionIds,
    year: oldestYear(kit),
    sku: kit.releases.find((release) => release.sku !== undefined)?.sku,
    isDraft: kit.isDraft,
    variants: kit.variants.map((variant) => ({
      name: variant.name,
      slots: variant.slots.map((slot) => ({
        count: slot.count,
        names: slot.buildsAs,
        parts: slot.parts,
        factionIds: slot.factionIds,
      })),
      minis: slotMinis(variant) + contained,
    })),
    minis: kit.minis,
    contains: kit.contains.flatMap((contained) => {
      const containedKit = containedKits.get(contained.kitId);
      return containedKit
        ? [{ kit: toKit(containedKit, containedKits), count: contained.count }]
        : [];
    }),
  };
}

/** The kit's name with every either-or outcome: "Boyz", "Lootas / Burna Boyz". */
export function kitName(kit: Kit): string {
  return kit.names.join(' / ');
}

/** The name a box of the kit gets, with its edition: "Boyz (2026)". */
export function boxKitName(kit: Kit): string {
  return kit.year === undefined ? kitName(kit) : `${kitName(kit)} (${kit.year})`;
}

/** Releases may be listed in any order in the catalog. */
function oldestYear(kit: CatalogKit): number | undefined {
  const years = kit.releases.flatMap((release) => (release.year === undefined ? [] : [release.year]));
  return years.length > 0 ? Math.min(...years) : undefined;
}
