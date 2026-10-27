import type { HobbyStatus, Mini } from '@greyhoarder/domain/hoard';
import { builtGroups, groupKey } from '../../models/mini-groups';
import { factionNamesOf } from '../../util/kit-labels';

/** Built minis of a box with the same name, parts and factions, as one card (docs/screens/box.md). */
export interface MiniGroup {
  /** Stays the same while the statuses of its minis change. */
  readonly id: string;
  readonly name: string;
  readonly factions: readonly string[];
  /** The names of the parts. */
  readonly parts: readonly string[];
  readonly minis: readonly Pick<Mini, 'id' | 'name' | 'status' | 'isOnWorkbench'>[];
  /** How many of the group's minis stand at each status. */
  readonly counts: Readonly<Partial<Record<HobbyStatus, number>>>;
}

/** The built minis as groups, in the order `builtGroups` gives them. */
export function toMiniGroups(
  minis: readonly Mini[],
  factionNames: ReadonlyMap<string, string>,
  partNames: ReadonlyMap<string, string>,
): MiniGroup[] {
  return builtGroups(minis).flatMap(([first, ...rest]) => {
    if (!first) {
      return [];
    }
    const group = [first, ...rest];
    const counts: Partial<Record<HobbyStatus, number>> = {};
    for (const { status } of group) {
      counts[status] = (counts[status] ?? 0) + 1;
    }
    return {
      id: groupKey(first),
      name: first.name,
      factions: factionNamesOf(first.factionIds, factionNames),
      parts: first.parts.flatMap((part) => partNames.get(part.partId) ?? []),
      minis: group.map(({ id, name, status, isOnWorkbench }) => ({
        id,
        name,
        status,
        isOnWorkbench,
      })),
      counts,
    };
  });
}
