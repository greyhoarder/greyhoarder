import { hobbyStatuses, type Mini } from '@greyhoarder/domain/hoard';

/**
 * The built minis of a box in groups of the same name, parts and factions, whose status and
 * workbench place may differ (docs/screens/box.md): the groups by the furthest status of their
 * minis, from done back to built, then by name; the minis of a group by status the same way.
 */
export function builtGroups(minis: readonly Mini[]): Mini[][] {
  const groups = new Map<string, Mini[]>();
  for (const mini of minis.filter((built) => built.status !== 'sprue')) {
    const key = groupKey(mini);
    groups.set(key, [...(groups.get(key) ?? []), mini]);
  }
  return [...groups.values()].map((group) => [...group].sort(byFurthestStatus)).sort(byFirstMini);
}

/** Equal for the minis of a group, different otherwise. */
export function groupKey(mini: Mini): string {
  return JSON.stringify([
    mini.name,
    mini.factionIds,
    mini.parts.map((part) => [part.partId, part.isSwappable]),
  ]);
}

/** Groups by their first mini, which has their furthest status. */
function byFirstMini(a: readonly Mini[], b: readonly Mini[]): number {
  const [first, other] = [a[0], b[0]];
  return first && other
    ? byFurthestStatus(first, other) || first.name.localeCompare(other.name)
    : 0;
}

function byFurthestStatus(a: Mini, b: Mini): number {
  return hobbyStatuses.indexOf(b.status) - hobbyStatuses.indexOf(a.status);
}
