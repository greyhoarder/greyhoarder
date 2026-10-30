/**
 * The factions a mini of these factions counts for: its own and every faction they are part of, up
 * the whole chain, each once (docs/domains/hoard.md, Lists of minis). Works on ids as on names, as
 * long as `partOf` uses the same.
 */
export function factionLineage(factions: readonly string[], partOf: ReadonlyMap<string, string>): string[] {
  const lineage = new Set<string>();
  for (const faction of factions) {
    for (let next: string | undefined = faction; next !== undefined && !lineage.has(next); next = partOf.get(next)) {
      lineage.add(next);
    }
  }
  return [...lineage];
}
