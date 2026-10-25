import type { Mini } from '@greyhoarder/domain/hoard';

/**
 * Minis are alike when they agree in everything a row of a list shows and edits together: name,
 * factions, status, parts and how they are fixed, notes, box and workbench place
 * (docs/domains/hoard.md, Lists of minis).
 */
export function areAlike(a: Mini, b: Mini): boolean {
  return alikeKey(a) === alikeKey(b);
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
  ]);
}
