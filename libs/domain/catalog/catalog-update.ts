/** The latest version of a catalog entry as imported so far. */
export interface VersionedEntry<T extends { readonly id: string }> {
  readonly entry: T;
  readonly version: number;
  readonly isRemoved: boolean;
}

/** What an import changes for one kind of catalog entry. */
export interface CatalogUpdate<T extends { readonly id: string }> {
  /** New entries start at version 1; changed ones get the next version. */
  readonly versions: readonly { readonly entry: T; readonly version: number }[];
  /** Latest versions that are missing from the snapshot. */
  readonly removedIds: readonly string[];
  /** Removed entries that are back unchanged. */
  readonly restoredIds: readonly string[];
}

/**
 * Compares the latest imported versions with a snapshot (ADR-0020): an
 * entry gets a new version only when its content changed, and one missing
 * from the snapshot is marked as removed, never deleted. The same snapshot
 * twice yields an empty update.
 */
export function planCatalogUpdate<T extends { readonly id: string }>(
  latest: readonly VersionedEntry<T>[],
  snapshot: readonly T[],
): CatalogUpdate<T> {
  const latestById = new Map(latest.map((current) => [current.entry.id, current]));
  const snapshotIds = new Set(snapshot.map((entry) => entry.id));
  const versions: { entry: T; version: number }[] = [];
  const restoredIds: string[] = [];

  for (const entry of snapshot) {
    const current = latestById.get(entry.id);
    if (!current) {
      versions.push({ entry, version: 1 });
    } else if (!hasSameContent(current.entry, entry)) {
      versions.push({ entry, version: current.version + 1 });
    } else if (current.isRemoved) {
      restoredIds.push(entry.id);
    }
  }

  const removedIds = latest
    .filter((current) => !current.isRemoved && !snapshotIds.has(current.entry.id))
    .map((current) => current.entry.id);

  return { versions, removedIds, restoredIds };
}

/** Key order and left-out optional fields don't count as a change; the order within lists does. */
function hasSameContent(a: unknown, b: unknown): boolean {
  return canonicalJson(a) === canonicalJson(b);
}

function canonicalJson(value: unknown): string {
  return JSON.stringify(value, (_key, nested: unknown) =>
    nested !== null && typeof nested === 'object' && !Array.isArray(nested)
      ? Object.fromEntries(Object.entries(nested).sort(([a], [b]) => a.localeCompare(b)))
      : nested,
  );
}
