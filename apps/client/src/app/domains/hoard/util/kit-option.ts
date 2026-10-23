import type { CatalogKit } from '@greyhoarder/domain/catalog';

/** A kit that a new box can be added from, as offered when searching for it. */
export interface KitOption {
  /** For catalog kits their path in the catalog, e.g. "games-workshop/orks/boyz-2026". */
  readonly id: string;
  readonly name: string;
  readonly manufacturer: string;
  readonly factions: readonly string[];
  /** The year the box first went on sale, if known. */
  readonly year?: number;
  /** The manufacturer's product code, e.g. "50-80", if the kit has one. */
  readonly sku?: string;
  /** Not yet checked against a physical box. */
  readonly isDraft: boolean;
  /** How many minis each variant yields, in the kit's order. */
  readonly variantMinis: readonly number[];
}

/** A catalog kit as offered; factions without a known name are left out. */
export function toKitOption(kit: CatalogKit, factionNames: ReadonlyMap<string, string>): KitOption {
  return {
    id: kit.id,
    name: kit.name,
    manufacturer: manufacturerName(kit.manufacturer),
    factions: kit.factionIds.flatMap((id) => factionNames.get(id) ?? []),
    year: kit.releases.find((release) => release.year !== undefined)?.year,
    sku: kit.releases.find((release) => release.sku !== undefined)?.sku,
    isDraft: kit.isDraft,
    variantMinis: variantMinis(kit),
  };
}

/** The catalog names manufacturers only by their folder, e.g. "games-workshop" → "Games Workshop". */
function manufacturerName(folder: string): string {
  return folder
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/** `minis` counts the first variant together with the contained kits, which every variant shares. */
function variantMinis(kit: CatalogKit): number[] {
  const slotMinis = kit.variants.map((variant) =>
    variant.slots.reduce((sum, slot) => sum + slot.count, 0),
  );
  const contained = kit.minis - (slotMinis[0] ?? 0);
  return slotMinis.length > 0 ? slotMinis.map((minis) => minis + contained) : [kit.minis];
}
