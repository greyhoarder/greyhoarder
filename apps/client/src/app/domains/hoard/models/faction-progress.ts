import { hasReached, type HobbyStatus, type Mini } from '@greyhoarder/domain/hoard';
import { factionLineage } from './faction-lineage';

/** How far the minis of one faction have come (docs/screens/dashboard.md). */
export interface FactionProgress {
  /** Left out for the minis without a faction. */
  readonly factionId?: string;
  readonly miniCount: number;
  /** Painted and done minis. */
  readonly paintedCount: number;
  /** Painted minis of all minis, from 0 to 100, rounded. */
  readonly paintedPercent: number;
  readonly statusCounts: Readonly<Record<HobbyStatus, number>>;
}

/**
 * The progress of every faction the minis belong to. A mini counts under
 * each of its factions and every faction they are part of, once each;
 * minis without one form a group without a faction id, after the factions. The factions come in the order the minis name them.
 */
export function factionProgresses(
  minis: readonly Pick<Mini, 'factionIds' | 'status'>[],
  partOf: ReadonlyMap<string, string> = new Map(),
): FactionProgress[] {
  const statusesByFaction = new Map<string | undefined, HobbyStatus[]>();
  for (const mini of minis) {
    for (const factionId of factionLineage(mini.factionIds, partOf)) {
      statusesByFaction.set(factionId, [...(statusesByFaction.get(factionId) ?? []), mini.status]);
    }
  }
  const withoutFaction = minis.filter((mini) => mini.factionIds.length === 0).map((mini) => mini.status);
  if (withoutFaction.length > 0) {
    statusesByFaction.set(undefined, withoutFaction);
  }
  return [...statusesByFaction].map(([factionId, statuses]) => ({
    ...(factionId === undefined ? {} : { factionId }),
    ...progressOf(statuses),
  }));
}

function progressOf(statuses: readonly HobbyStatus[]): Omit<FactionProgress, 'factionId'> {
  const paintedCount = statuses.filter((status) => hasReached(status, 'painted')).length;
  return {
    miniCount: statuses.length,
    paintedCount,
    paintedPercent: Math.round((paintedCount / statuses.length) * 100),
    statusCounts: statusCountsOf(statuses),
  };
}

function statusCountsOf(statuses: readonly HobbyStatus[]): Record<HobbyStatus, number> {
  const count = (step: HobbyStatus): number => statuses.filter((status) => status === step).length;
  return {
    sprue: count('sprue'),
    built: count('built'),
    primed: count('primed'),
    painted: count('painted'),
    done: count('done'),
  };
}
