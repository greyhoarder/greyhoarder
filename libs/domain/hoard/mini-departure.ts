/** Why a mini left the hoard (docs/domains/hoard.md, Leaving the hoard). */
export const departureReasons = ['sold', 'given-away', 'stripped', 'lost'] as const;

export type DepartureReason = (typeof departureReasons)[number];

/** How a mini left the hoard. */
export interface Departure {
  readonly reason: DepartureReason;
  /** ISO date, e.g. "2026-10-12". */
  readonly on: string;
  /** For minis stripped for parts: the minis that got them. */
  readonly recipientMiniIds?: readonly string[];
}

/** A departure by the rules: only a mini stripped for parts has recipients, each once. */
export function parseDeparture(departure: Departure): Departure {
  const recipientMiniIds = departure.reason === 'stripped' ? [...new Set(departure.recipientMiniIds ?? [])] : [];
  return recipientMiniIds.length === 0
    ? { reason: departure.reason, on: departure.on }
    : { ...departure, recipientMiniIds };
}

/** A gone mini left the hoard; its record stays. Takes anything that shows a mini's departure. */
export function isGone(mini: { readonly departure?: Departure }): boolean {
  return mini.departure !== undefined;
}
