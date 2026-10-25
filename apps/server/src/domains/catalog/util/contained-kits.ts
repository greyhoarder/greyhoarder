import type { CatalogKit } from '@greyhoarder/domain/catalog';
import type { VersionedEntry } from '../models/versioned-entry.js';

/**
 * Every kit the kits contain, also within contained bundles, each once and without the kits
 * themselves. A contained kit that is no longer offered still belongs to the bundles that contain it.
 */
export async function findContainedKits(
  kits: readonly VersionedEntry<CatalogKit>[],
  findKits: (ids: readonly string[]) => Promise<VersionedEntry<CatalogKit>[]>,
): Promise<VersionedEntry<CatalogKit>[]> {
  const knownIds = new Set(kits.map(({ entry }) => entry.id));
  const containedKits: VersionedEntry<CatalogKit>[] = [];
  let ids = unknownContainedIds(kits, knownIds);
  while (ids.length > 0) {
    const found = await findKits(ids);
    ids.forEach((id) => knownIds.add(id));
    containedKits.push(...found);
    ids = unknownContainedIds(found, knownIds);
  }
  return containedKits;
}

function unknownContainedIds(
  kits: readonly VersionedEntry<CatalogKit>[],
  knownIds: ReadonlySet<string>,
): string[] {
  return [...new Set(kits.flatMap(({ entry }) => entry.contains.map((contained) => contained.kitId)))].filter(
    (id) => !knownIds.has(id),
  );
}
