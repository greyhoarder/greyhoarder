import type { CatalogFaction } from '../models/catalog-faction.js';

/**
 * The faction each of the factions is part of, and so on up the whole chain, by faction id: a
 * successor chapter of the Dark Angels leads to the Dark Angels and on to the Space Marines.
 * Factions that are part of no other have no entry.
 */
export async function findFactionLineage(
  factionIds: readonly string[],
  findFactions: (ids: readonly string[]) => Promise<CatalogFaction[]>,
): Promise<ReadonlyMap<string, string>> {
  const partOf = new Map<string, string>();
  const known = new Set<string>();
  let next = [...new Set(factionIds)];
  while (next.length > 0) {
    next.forEach((id) => known.add(id));
    const parents = (await findFactions(next)).flatMap(({ id, partOfId }) =>
      partOfId === undefined ? [] : [[id, partOfId] as const],
    );
    parents.forEach(([id, partOfId]) => partOf.set(id, partOfId));
    next = [...new Set(parents.map(([, partOfId]) => partOfId))].filter((id) => !known.has(id));
  }
  return partOf;
}
