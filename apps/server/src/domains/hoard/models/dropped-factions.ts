import { isOwnFaction, type Mini } from '@greyhoarder/domain/hoard';

/**
 * The ids of the own factions the minis carried before a change and no longer carry after it;
 * deleted minis carry none after it. Those factions are deleted unless another mini still carries
 * them (docs/domains/hoard.md, Factions).
 */
export function droppedFactions(before: readonly Mini[], after: readonly Mini[]): string[] {
  const kept = new Set(after.flatMap((mini) => mini.factionIds));
  const carried = new Set(before.flatMap((mini) => mini.factionIds).filter(isOwnFaction));
  return [...carried].filter((factionId) => !kept.has(factionId));
}
