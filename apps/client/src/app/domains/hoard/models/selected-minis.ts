import { type HobbyStatus, hobbyStatuses, type Mini, withChanges } from '@greyhoarder/domain/hoard';
import type { FactionChange, PartChange } from './mini-changes';

/**
 * What the user changed on the selected minis, to be applied to each of them; left out means
 * unchanged (docs/use-cases/edit-several-minis.md). New factions and parts go by their names.
 */
export interface ChangesToSelectedMinis {
  readonly status?: HobbyStatus;
  readonly workbench?: 'put-on' | 'take-off';
  readonly addFactions?: readonly FactionChange[];
  readonly removeFactionIds?: readonly string[];
  /** Also parts the minis carry already, glued or swappable as given. */
  readonly addParts?: readonly PartChange[];
  readonly removePartIds?: readonly string[];
}

/** How many of the minis carry a faction. */
export interface FactionShare {
  readonly id: string;
  readonly count: number;
}

/** How many of the minis carry a part, and whether glued, swappable or both. */
export interface PartShare {
  readonly partId: string;
  readonly count: number;
  readonly carried: 'glued' | 'swappable' | 'mixed';
}

/** The words for a status in a count, e.g. "3 built". */
const STATUS_WORDS: Readonly<Record<HobbyStatus, string>> = {
  sprue: 'on the sprue',
  built: 'built',
  primed: 'primed',
  painted: 'painted',
  done: 'done',
};

/** The status every one of the minis has; none while they don't share one. */
export function sharedStatus(minis: readonly Mini[]): HobbyStatus | undefined {
  const statuses = new Set(minis.map((mini) => mini.status));
  return statuses.size === 1 ? [...statuses][0] : undefined;
}

/** How the status of the minis is mixed, in pipeline order, e.g. "Mixed: 3 built, 2 primed". */
export function mixedStatus(minis: readonly Mini[]): string {
  const counts = hobbyStatuses
    .map((status) => ({ status, count: minis.filter((mini) => mini.status === status).length }))
    .filter(({ count }) => count > 0)
    .map(({ status, count }) => `${count} ${STATUS_WORDS[status]}`);
  return `Mixed: ${counts.join(', ')}`;
}

/** Every faction any of the minis carries, in the order they come, with how many carry it. */
export function factionShares(minis: readonly Mini[]): FactionShare[] {
  const counts = new Map<string, number>();
  for (const id of minis.flatMap((mini) => mini.factionIds)) {
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }
  return [...counts].map(([id, count]) => ({ id, count }));
}

/** Every part any of the minis carries, in the order they come, with how many carry it and how. */
export function partShares(minis: readonly Mini[]): PartShare[] {
  const shares = new Map<string, PartShare>();
  for (const { partId, isSwappable } of minis.flatMap((mini) => mini.parts)) {
    const carried = isSwappable ? 'swappable' : 'glued';
    const known = shares.get(partId);
    shares.set(partId, {
      partId,
      count: (known?.count ?? 0) + 1,
      carried: known === undefined || known.carried === carried ? carried : 'mixed',
    });
  }
  return [...shares.values()];
}

/**
 * How many of the minis can't go on the workbench: done or gone ones, and all of them once the
 * status to be set is done.
 */
export function workbenchRefusals(minis: readonly Mini[], status?: HobbyStatus): number {
  return minis.filter((mini) => !withChanges(mini, { status, workbench: 'put-on' }).isOnWorkbench).length;
}

/**
 * The changes in a sentence, e.g. "Status, workbench, 1 faction and 2 parts change on 5 minis.";
 * "Nothing changed yet." without any.
 */
export function changesSummary(changes: ChangesToSelectedMinis, count: number): string {
  const factions = (changes.addFactions?.length ?? 0) + (changes.removeFactionIds?.length ?? 0);
  const parts = (changes.addParts?.length ?? 0) + (changes.removePartIds?.length ?? 0);
  const items = [
    ...(changes.status === undefined ? [] : ['status']),
    ...(changes.workbench === undefined ? [] : ['workbench']),
    ...(factions === 0 ? [] : [counted(factions, 'faction')]),
    ...(parts === 0 ? [] : [counted(parts, 'part')]),
  ];
  const [first, ...rest] = items;
  if (first === undefined) {
    return 'Nothing changed yet.';
  }
  const isOne = rest.length === 0 && (factions + parts === 0 || factions + parts === 1);
  const last = rest.pop();
  const list = last === undefined ? first : `${[first, ...rest].join(', ')} and ${last}`;
  return `${list.charAt(0).toUpperCase()}${list.slice(1)} ${isOne ? 'changes' : 'change'} on ${counted(count, 'mini')}.`;
}

function counted(count: number, word: string): string {
  return `${count} ${word}${count === 1 ? '' : 's'}`;
}
