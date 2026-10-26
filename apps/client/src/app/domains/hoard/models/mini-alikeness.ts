import type { Mini } from '@greyhoarder/domain/hoard';

/**
 * Minis are alike when they agree in everything a row of a list shows and edits together: name,
 * factions, status, parts and how they are fixed, notes, box, workbench place and departure
 * (docs/domains/hoard.md, Lists of minis).
 */
export function areAlike(a: Mini, b: Mini): boolean {
  return alikeKey(a) === alikeKey(b);
}

/** Alike minis bundled, in the order their first mini comes. */
export function alikeGroups(minis: readonly Mini[]): Mini[][] {
  const groups = new Map<string, Mini[]>();
  for (const mini of minis) {
    const key = alikeKey(mini);
    groups.set(key, [...(groups.get(key) ?? []), mini]);
  }
  return [...groups.values()];
}

/** Equal for alike minis, different otherwise; to bundle them into rows. */
export function alikeKey(mini: Mini): string {
  return JSON.stringify([
    mini.name,
    mini.factionIds,
    mini.status,
    mini.parts.map((part) => [part.partId, part.isSwappable]),
    mini.notes ?? '',
    mini.boxId,
    mini.isOnWorkbench,
    mini.departure ?? null,
  ]);
}
