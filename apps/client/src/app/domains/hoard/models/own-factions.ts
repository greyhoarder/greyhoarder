import { factionKey, isOwnFaction, type Mini, type OwnFaction } from '@greyhoarder/domain/hoard';

/**
 * The user's own factions: those the minis carry, gone ones included, since an own faction no mini
 * carries is deleted (docs/domains/hoard.md, Factions). Sorted by name.
 */
export function ownFactionsOf(minis: readonly Mini[], names: ReadonlyMap<string, string>): OwnFaction[] {
  const ids = new Set(minis.flatMap((mini) => mini.factionIds).filter(isOwnFaction));
  return [...ids]
    .map((id) => ({ id, name: names.get(id) ?? '' }))
    .filter((faction) => faction.name !== '')
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * The typed name, for a new own faction, unless it is empty or a faction found has it, ignoring
 * case: one name never stands for two factions (docs/domains/hoard.md, Factions).
 */
export function newFactionName(typed: string, found: readonly { readonly name: string }[]): string | undefined {
  const name = typed.trim();
  const isTaken = found.some((faction) => factionKey(faction.name) === factionKey(name));
  return name === '' || isTaken ? undefined : name;
}
