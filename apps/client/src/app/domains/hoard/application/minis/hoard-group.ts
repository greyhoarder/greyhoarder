import { type HobbyStatus, hobbyStatuses, isGone } from '@greyhoarder/domain/hoard';
import { boxLabel } from '../../util/box-labels';
import type { MiniRow } from './mini-row';
import { byBox } from './mini-sort';

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
  /**
   * The boxes its minis come from, once each, by name and number ("Boyz (2026) #2"); undefined
   * for minis without a box.
   */
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
    for (const row of members) {
      if (!isGone(row)) {
        counts[row.status] = (counts[row.status] ?? 0) + row.count;
      }
    }
    return {
      id: first.groupId ?? first.id,
      name: first.name,
      factions: first.factions,
      parts: first.parts,
      boxes: [
        ...new Map(
          members.map((row) => [
            row.boxId ?? row.box,
            row.box === undefined ? undefined : boxLabel(row.box, row.boxNumber),
          ]),
        ).values(),
      ],
      rows: [...members].sort(byFurthestStatus),
      counts,
    };
  });
}

function byFurthestStatus(a: MiniRow, b: MiniRow): number {
  return (
    Number(isGone(a)) - Number(isGone(b)) ||
    hobbyStatuses.indexOf(b.status) - hobbyStatuses.indexOf(a.status) ||
    byBox(a, b)
  );
}
