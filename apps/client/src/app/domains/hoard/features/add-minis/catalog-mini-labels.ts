import type { CatalogMini } from '../../../catalog/api';

/** Tells catalog minis apart: the same name for another faction or from another kit is another mini. */
export function catalogMiniKey(mini: CatalogMini): string {
  return `${mini.name}\n${mini.factionId ?? ''}\n${mini.kit.id}`;
}

/** The kit it comes from, e.g. "Boyz · 2026". */
export function kitText({ kit }: CatalogMini): string {
  return kit.year === undefined ? kit.name : `${kit.name} · ${kit.year}`;
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
