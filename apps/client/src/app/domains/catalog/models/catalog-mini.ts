/** A name slots of catalog kits can be built as, for one faction (docs/domains/catalog.md). */
export interface CatalogMini {
  readonly name: string;
  /** Left out for minis of kits without a game system. */
  readonly factionId?: string;
  /** What the slots offer, each once, in the order they first come. */
  readonly parts: readonly string[];
  /** The kits it comes from. */
  readonly kits: readonly {
    readonly id: string;
    readonly name: string;
    /** The year of its oldest release, if known. */
    readonly year?: number;
    readonly isDraft: boolean;
  }[];
}
