import { hasReached, type HobbyStatus, hobbyStatuses, type Mini } from '@greyhoarder/domain/hoard';

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
 * each of its factions; minis without one form a group without a faction id,
 * after the factions. The factions come in the order the minis name them.
 */
export function factionProgresses(minis: readonly Pick<Mini, 'factionIds' | 'status'>[]): FactionProgress[] {
  const statusesByFaction = new Map<string | undefined, HobbyStatus[]>();
  for (const mini of minis) {
    for (const factionId of mini.factionIds) {
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
    statusCounts: Object.fromEntries(
      hobbyStatuses.map((step) => [step, statuses.filter((status) => status === step).length]),
    ) as Record<HobbyStatus, number>,
  };
}
