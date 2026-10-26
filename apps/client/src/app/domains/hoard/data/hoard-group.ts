import { type HobbyStatus, hobbyStatuses } from '@greyhoarder/domain/hoard';
import type { MiniRow } from './mini-row';

/**
 * Minis past the sprue with the same name, factions and parts from any box, as one card of the
 * Minis tab (docs/screens/hoard.md).
 */
export interface HoardGroup {
  readonly id: string;
  readonly name: string;
  readonly factions: readonly string[];
  /** The names of the parts. */
  readonly parts: readonly string[];
  /** The names of the boxes its minis come from, once each; undefined for minis without a box. */
  readonly boxes: readonly (string | undefined)[];
  /** One row per mini, furthest status first, gone ones last, then by box. */
  readonly rows: readonly MiniRow[];
  /** How many of the minis that are not gone stand at each status. */
  readonly counts: Readonly<Partial<Record<HobbyStatus, number>>>;
}

/** The rows as groups, in the order their first row comes. */
export function toHoardGroups(rows: readonly MiniRow[]): HoardGroup[] {
  const byGroup = new Map<string, MiniRow[]>();
  for (const row of rows) {
    const groupId = row.groupId ?? row.id;
    byGroup.set(groupId, [...(byGroup.get(groupId) ?? []), row]);
  }
  return [...byGroup.values()].flatMap((members) => {
    const [first] = members;
    if (!first) {
      return [];
    }
    const counts: Partial<Record<HobbyStatus, number>> = {};
    for (const { status, departure, count } of members) {
      if (!departure) {
        counts[status] = (counts[status] ?? 0) + count;
      }
    }
    return {
      id: first.groupId ?? first.id,
      name: first.name,
      factions: first.factions,
      parts: first.parts,
      boxes: [...new Set(members.map((row) => row.box))],
      rows: [...members].sort(byFurthestStatus),
      counts,
    };
  });
}

function byFurthestStatus(a: MiniRow, b: MiniRow): number {
  return (
    Number(a.departure !== undefined) - Number(b.departure !== undefined) ||
    hobbyStatuses.indexOf(b.status) - hobbyStatuses.indexOf(a.status) ||
    (a.box ?? '￿').localeCompare(b.box ?? '￿')
  );
}
