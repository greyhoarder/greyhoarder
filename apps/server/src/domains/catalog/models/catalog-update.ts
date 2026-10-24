import type { VersionedEntry } from './versioned-entry.js';

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
 * from the snapshot is marked as removed, never deleted, unless it is one of
 * `keptIds` (left out of the snapshot for a format problem). The same
 * snapshot twice yields an empty update.
 */
export function planCatalogUpdate<T extends { readonly id: string }>(
  latest: readonly VersionedEntry<T>[],
  snapshot: readonly T[],
  keptIds: readonly string[] = [],
): CatalogUpdate<T> {
  const latestById = new Map(latest.map((current) => [current.entry.id, current]));
  const snapshotIds = new Set([...snapshot.map((entry) => entry.id), ...keptIds]);
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
