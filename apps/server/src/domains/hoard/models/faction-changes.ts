import { findOwnFaction, type OwnFaction, ownFactionId } from '@greyhoarder/domain/hoard';

/** A faction to give minis: a catalog faction or an own one by its id, or a name. */
export type FactionChange = { readonly id: string } | { readonly name: string };

/**
 * The factions as ids. A name refers to the own faction of that name, or to a new own faction, one
 * per name however often it is given (docs/domains/hoard.md, Factions). Ids are taken as they are;
 * whether they exist is for the caller to check.
 */
export function resolveFactions(
  ownFactions: readonly OwnFaction[],
  changes: readonly FactionChange[],
  newId: () => string,
): { factionIds: string[]; newFactions: OwnFaction[] } {
  const newFactions: OwnFaction[] = [];
  const factionIds = changes.map((change) => {
    if ('id' in change) {
      return change.id;
    }
    let known = findOwnFaction([...ownFactions, ...newFactions], change.name);
    if (!known) {
      known = { id: ownFactionId(newId()), name: change.name.trim() };
      newFactions.push(known);
    }
    return known.id;
  });
  return { factionIds: [...new Set(factionIds)], newFactions };
}
