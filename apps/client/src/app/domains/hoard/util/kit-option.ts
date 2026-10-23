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
  /** EAN/GTIN codes printed on the box, digits only. */
  readonly barcodes: readonly string[];
  /** Not yet checked against a physical box. */
  readonly isDraft: boolean;
  /** How many minis each variant yields, in the kit's order. */
  readonly variantMinis: readonly number[];
}
