/** A name the slots of one catalog kit can be built as, for one faction (docs/domains/catalog.md). */
export interface CatalogMini {
  readonly name: string;
  /** Left out for minis of kits without a game system. */
  readonly factionId?: string;
  /** What the slots offer, each once, in the order they first come. */
  readonly parts: readonly string[];
  /** The kit it comes from, in the version the search found. */
  readonly kit: {
    readonly id: string;
    readonly version: number;
    readonly name: string;
    /** The year of its oldest release, if known. */
    readonly year?: number;
    readonly isDraft: boolean;
  };
}
