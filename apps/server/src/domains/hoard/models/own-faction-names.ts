import type { Mini, OwnFaction } from '@greyhoarder/domain/hoard';

/** The names of those own factions the minis carry, by id. */
export function ownFactionNamesOf(minis: readonly Mini[], ownFactions: readonly OwnFaction[]): Map<string, string> {
  const carried = new Set(minis.flatMap((mini) => mini.factionIds));
  return new Map(ownFactions.filter((faction) => carried.has(faction.id)).map((faction) => [faction.id, faction.name]));
}
