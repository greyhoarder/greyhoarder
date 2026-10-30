/** A faction the user made up, e.g. a successor chapter (docs/domains/hoard.md, Factions). */
export interface OwnFaction {
  /** `own/<uuid>`, so it never collides with a catalog faction's `<system>/<faction>`. */
  readonly id: string;
  readonly name: string;
}

const OWN_PREFIX = 'own/';

/** The id of a new own faction. */
export function ownFactionId(uuid: string): string {
  return `${OWN_PREFIX}${uuid}`;
}

/** Whether the faction is one of the user's own, not one of the catalog. */
export function isOwnFaction(factionId: string): boolean {
  return factionId.startsWith(OWN_PREFIX);
}

/** What tells factions apart: their name ignoring case and surrounding spaces. */
export function factionKey(text: string): string {
  return text.trim().toLowerCase();
}

/** The own faction of that name, ignoring case and surrounding spaces. */
export function findOwnFaction(factions: readonly OwnFaction[], name: string): OwnFaction | undefined {
  const key = factionKey(name);
  return factions.find((faction) => factionKey(faction.name) === key);
}
