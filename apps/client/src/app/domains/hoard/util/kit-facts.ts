import type { KitOption } from './kit-option';

/** E.g. "Games Workshop · Orks · 2026 · 50-80"; parts the kit doesn't have are left out. */
export function kitMeta(kit: KitOption): string {
  return [kit.manufacturer, ...kit.factions, kit.year?.toString(), kit.sku]
    .filter((part) => part !== undefined && part !== '')
    .join(' · ');
}

/**
 * How many minis the kit yields: "1 mini", "10 minis", and for either-or kits
 * whose variants differ "3 or 5 minis" (variants of the same size count once).
 */
export function kitMinis(kit: KitOption): string {
  const counts = [...new Set(kit.variantMinis)];
  const last = counts.at(-1) ?? 0;
  const unit = counts.length === 1 && last === 1 ? 'mini' : 'minis';
  if (counts.length <= 1) {
    return `${last} ${unit}`;
  }
  return `${counts.slice(0, -1).join(', ')} or ${last} ${unit}`;
}

/** The kits whose name, product code or barcode contains the query, ignoring case. */
export function searchKits(kits: readonly KitOption[], query: string): KitOption[] {
  const needle = query.trim().toLowerCase();
  if (needle === '') {
    return [...kits];
  }
  return kits.filter((kit) =>
    [kit.name, kit.sku ?? '', ...kit.barcodes].some((text) => text.toLowerCase().includes(needle)),
  );
}
