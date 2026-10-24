/** An army of a game system, e.g. Orks. */
export interface CatalogFaction {
  /** `<system>/<faction>`, e.g. "warhammer-40000/orks". */
  readonly id: string;
  readonly systemId: string;
  readonly name: string;
  /** Id of its group within the system; left out with `partOfId`. */
  readonly groupId?: string;
  /** A faction whose kits all apply to this one as well. */
  readonly partOfId?: string;
}
