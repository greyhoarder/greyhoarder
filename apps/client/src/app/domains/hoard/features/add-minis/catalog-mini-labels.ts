import type { CatalogMini } from '../../../catalog/api';

/** More kits are counted, not named. */
const NAMED_KITS = 3;

/** Tells catalog minis apart: the same name for another faction is another mini. */
export function catalogMiniKey(mini: CatalogMini): string {
  return `${mini.name}\n${mini.factionId ?? ''}`;
}

/** The kits it comes from, e.g. "Boyz · 2026, Nobz · 2009", the first three and "+{n} more". */
export function kitsText(mini: CatalogMini): string {
  const named = mini.kits
    .slice(0, NAMED_KITS)
    .map((kit) => (kit.year === undefined ? kit.name : `${kit.name} · ${kit.year}`))
    .join(', ');
  const more = mini.kits.length - NAMED_KITS;
  return more > 0 ? `${named} +${more} more` : named;
}

/** "{faction} · {game system}", e.g. "Orks · Warhammer 40,000"; empty without a faction. */
export function factionText(
  mini: CatalogMini,
  factionNames: ReadonlyMap<string, string>,
  systemNames: ReadonlyMap<string, string>,
): string {
  const { factionId } = mini;
  if (factionId === undefined) {
    return '';
  }
  const faction = factionNames.get(factionId) ?? factionId;
  const system = systemNames.get(factionId);
  return system === undefined ? faction : `${faction} · ${system}`;
}
