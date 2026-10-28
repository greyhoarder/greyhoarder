/** A catalog faction as a search offers it. */
export interface FoundFaction {
  /** `<system>/<faction>`, e.g. "warhammer-40000/orks". */
  readonly id: string;
  readonly name: string;
  readonly systemName: string;
}
