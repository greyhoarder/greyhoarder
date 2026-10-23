/** One packaging of a kit's sprues: box, product code and barcode. */
export interface KitRelease {
  /** The year this packaging first went on sale on its own. */
  readonly year?: number;
  /** The manufacturer's product code, e.g. "50-80". */
  readonly sku?: string;
  /** EAN/GTIN from the box, digits only. */
  readonly barcode?: string;
}

/** A group of minis within a variant that can be built the same way. */
export interface KitSlot {
  readonly count: number;
  /** Short model names within the kit; the first is the most common build. */
  readonly buildsAs: readonly string[];
  readonly parts: readonly string[];
  /** Empty when the slot belongs to the kit's factions. */
  readonly factionIds: readonly string[];
}

/** One either-or outcome of a kit, e.g. "Lootas" or "Burna Boyz". */
export interface KitVariant {
  readonly name: string;
  readonly slots: readonly KitSlot[];
}

/** A kit whose sprues are in a bundle unchanged. */
export interface ContainedKit {
  readonly kitId: string;
  readonly count: number;
}

/** A kit of the community catalog, as of one catalog commit (ADR-0020). */
export interface CatalogKit {
  /** Its path in the catalog repository, e.g. "games-workshop/orks/boyz-2026"; never changes. */
  readonly id: string;
  /** The first folder of the id, e.g. "games-workshop". */
  readonly manufacturer: string;
  readonly name: string;
  /** `<system>/<faction>` or a whole `<system>`; the first is the army it is mainly sold for. */
  readonly factionIds: readonly string[];
  readonly releases: readonly KitRelease[];
  /** Minis the box yields; for either-or kits those of the first variant. */
  readonly minis: number;
  /** Not yet checked against a physical box. */
  readonly isDraft: boolean;
  /** The previous edition with other sprues. */
  readonly supersedesId?: string;
  readonly contains: readonly ContainedKit[];
  readonly variants: readonly KitVariant[];
}
