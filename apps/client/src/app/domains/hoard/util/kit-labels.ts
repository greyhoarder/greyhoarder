import type { Kit } from '../models/kit';

/** E.g. "Games Workshop · 50-80"; the year goes with the name. */
export function kitMeta(kit: Kit): string {
  return [manufacturerName(kit.manufacturer), kit.sku]
    .filter((part) => part !== undefined && part !== '')
    .join(' · ');
}

/** The catalog names manufacturers only by their folder, e.g. "games-workshop" → "Games Workshop". */
function manufacturerName(folder: string): string {
  return folder
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/** The names of the factions, leaving out those whose names are unknown. */
export function factionNamesOf(
  factionIds: readonly string[],
  factionNames: ReadonlyMap<string, string>,
): string[] {
  return factionIds.flatMap((id) => factionNames.get(id) ?? []);
}

/** "1 mini" or "{n} minis". */
export function minisLabel(count: number): string {
  return count === 1 ? '1 mini' : `${count} minis`;
}

/**
 * How many minis the kit yields: "1 mini", "10 minis", and for either-or kits
 * whose variants differ "5 or 10 minis" (variants of the same size count once).
 */
export function kitMinis(kit: Kit): string {
  const counts = [...new Set(kit.variants.map((variant) => variant.minis))].sort((a, b) => a - b);
  const last = counts.at(-1) ?? kit.minis;
  if (counts.length <= 1) {
    return minisLabel(last);
  }
  return `${counts.slice(0, -1).join(', ')} or ${last} minis`;
}
