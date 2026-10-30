import { factionKey, isOwnFaction } from '@greyhoarder/domain/hoard';
import type { FactionChange } from './mini-changes';

/** A faction as a screen shows and gives it; a new own faction has a name but no id yet. */
export interface FactionDraft {
  readonly id?: string;
  readonly name: string;
}

/** A new own faction goes by its name, which the server finds among the user's own or adds to them. */
export function toFactionChange(faction: FactionDraft): FactionChange {
  return faction.id === undefined ? { name: faction.name } : { id: faction.id };
}

/** The ids of the factions that have one; new own factions have none yet. */
export function idsOf(factions: readonly FactionDraft[]): string[] {
  return factions.flatMap((faction) => (faction.id === undefined ? [] : [faction.id]));
}

/** Whether the faction is among those chosen: by its id, or a new one by its name ignoring case. */
export function hasFaction(chosen: readonly FactionDraft[], faction: FactionDraft): boolean {
  return chosen.some((known) =>
    faction.id === undefined
      ? factionKey(known.name) === factionKey(faction.name)
      : known.id === faction.id,
  );
}

/** A new faction, which has no id yet, is always one of the user's own. */
export function isOwnDraft(faction: FactionDraft): boolean {
  return faction.id === undefined || isOwnFaction(faction.id);
}
