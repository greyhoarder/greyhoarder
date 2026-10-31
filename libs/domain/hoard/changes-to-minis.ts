import type { HobbyStatus } from './hobby-status.js';
import { leavesWorkbench, type Mini, type MiniPart, parseMini, withStatus } from './mini.js';
import { isGone } from './mini-departure.js';

/**
 * What the user changed for several minis at once; everything left out stays as each mini has it
 * (docs/use-cases/edit-several-minis.md). Factions and parts are added or removed, never replaced.
 */
export interface ChangesToMinis {
  readonly status?: HobbyStatus;
  readonly workbench?: 'put-on' | 'take-off';
  readonly addFactionIds?: readonly string[];
  readonly removeFactionIds?: readonly string[];
  /** A part a mini carries already is kept once, glued or swappable as given here. */
  readonly addParts?: readonly MiniPart[];
  readonly removePartIds?: readonly string[];
}

/** Whether all the minis have the same name; only then their parts are changed together. */
export function haveSameName(minis: readonly Mini[]): boolean {
  return new Set(minis.map((mini) => mini.name)).size <= 1;
}

/**
 * A mini with the changes made to several minis at once. Only minis that are neither done nor gone
 * go on the workbench; once done, a mini leaves it (docs/domains/hoard.md, Workbench).
 */
export function withChanges(mini: Mini, changes: ChangesToMinis): Mini {
  const removedFactions = new Set(changes.removeFactionIds ?? []);
  const addedParts = changes.addParts ?? [];
  const removedParts = new Set([...(changes.removePartIds ?? []), ...addedParts.map((part) => part.partId)]);
  const factionIds = [
    ...new Set([...mini.factionIds.filter((id) => !removedFactions.has(id)), ...(changes.addFactionIds ?? [])]),
  ];
  const parts = [...mini.parts.filter((part) => !removedParts.has(part.partId)), ...addedParts];
  const changed = changes.status === undefined ? mini : withStatus(mini, changes.status);
  const isOnWorkbench =
    changes.workbench === undefined
      ? changed.isOnWorkbench
      : changes.workbench === 'put-on' && !leavesWorkbench(changed.status) && !isGone(changed);
  return parseMini({ ...changed, factionIds, parts, isOnWorkbench });
}
