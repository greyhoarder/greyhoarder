import type { CatalogKit } from '@greyhoarder/domain/catalog';
import type { CatalogFaction } from './catalog-faction.js';
import type { GameSystem } from './game-system.js';

/** The whole catalog of one release, as read from the catalog repository. */
export interface CatalogSnapshot {
  /** Changes whenever anything in the snapshot changes. */
  readonly hash: string;
  readonly systems: readonly GameSystem[];
  readonly factions: readonly CatalogFaction[];
  readonly kits: readonly CatalogKit[];
  /**
   * Ids whose files or references don't match the format this release knows. They are left out
   * of the snapshot, but keep their last imported version instead of being marked as removed.
   */
  readonly skipped: {
    readonly systemIds: readonly string[];
    readonly factionIds: readonly string[];
    readonly kitIds: readonly string[];
  };
}

/** An entry the snapshot leaves out, and why. */
interface LeftOut {
  readonly id: string;
  readonly problem: string;
}

/**
 * Keeps the factions and kits whose references point into the catalog, so the rest of the server
 * can trust them; an entry that refers to one that was left out is left out as well, and so is a
 * kit that contains itself, also through other kits.
 */
export function withResolvedReferences(read: {
  readonly systems: readonly GameSystem[];
  readonly factions: readonly CatalogFaction[];
  readonly kits: readonly CatalogKit[];
}): {
  factions: CatalogFaction[];
  kits: CatalogKit[];
  leftOutFactions: LeftOut[];
  leftOutKits: LeftOut[];
} {
  const groupIds = new Set(read.systems.flatMap((system) => system.groups.map((group) => `${system.id}/${group.id}`)));
  const systemIds = new Set(read.systems.map((system) => system.id));
  const factions = keepResolved(read.factions, (faction, factionIds) => factionProblem(faction, groupIds, factionIds));
  const factionIds = new Set(factions.kept.map((faction) => faction.id));
  const kitsById = new Map(read.kits.map((kit) => [kit.id, kit]));
  const kits = keepResolved(read.kits, (kit, kitIds) => kitProblem(kit, { systemIds, factionIds, kitIds, kitsById }));
  return { factions: factions.kept, kits: kits.kept, leftOutFactions: factions.leftOut, leftOutKits: kits.leftOut };
}

/** Leaves out every entry with a problem, until the rest only refer to each other. */
function keepResolved<T extends { readonly id: string }>(
  entries: readonly T[],
  problemOf: (entry: T, keptIds: ReadonlySet<string>) => string | undefined,
): { kept: T[]; leftOut: LeftOut[] } {
  let kept = [...entries];
  const leftOut: LeftOut[] = [];
  for (;;) {
    const keptIds = new Set(kept.map((entry) => entry.id));
    const next = kept.filter((entry) => {
      const problem = problemOf(entry, keptIds);
      if (problem !== undefined) {
        leftOut.push({ id: entry.id, problem });
      }
      return problem === undefined;
    });
    if (next.length === kept.length) {
      return { kept, leftOut };
    }
    kept = next;
  }
}

function factionProblem(
  faction: CatalogFaction,
  groupIds: ReadonlySet<string>,
  factionIds: ReadonlySet<string>,
): string | undefined {
  if (faction.groupId !== undefined && !groupIds.has(`${faction.systemId}/${faction.groupId}`)) {
    return `unknown group ${faction.groupId}`;
  }
  if (faction.partOfId !== undefined && !factionIds.has(faction.partOfId)) {
    return `unknown partOf ${faction.partOfId}`;
  }
  return undefined;
}

function kitProblem(
  kit: CatalogKit,
  catalog: {
    readonly systemIds: ReadonlySet<string>;
    readonly factionIds: ReadonlySet<string>;
    readonly kitIds: ReadonlySet<string>;
    readonly kitsById: ReadonlyMap<string, CatalogKit>;
  },
): string | undefined {
  const { systemIds, factionIds, kitIds } = catalog;
  const slotFactionIds = kit.variants.flatMap((variant) => variant.slots.flatMap((slot) => slot.factionIds));
  const unknownFaction = [...kit.factionIds, ...slotFactionIds].find((id) => !factionIds.has(id) && !systemIds.has(id));
  if (unknownFaction !== undefined) {
    return `unknown faction ${unknownFaction}`;
  }
  const unknownKit = [kit.supersedesId, ...kit.contains.map((contained) => contained.kitId)].find(
    (id) => id !== undefined && !kitIds.has(id),
  );
  if (unknownKit !== undefined) {
    return `unknown kit ${unknownKit}`;
  }
  return containsItself(kit, catalog.kitsById) ? 'contains itself' : undefined;
}

function containsItself(kit: CatalogKit, kitsById: ReadonlyMap<string, CatalogKit>): boolean {
  const seenIds = new Set<string>();
  let ids = kit.contains.map((contained) => contained.kitId);
  while (ids.length > 0) {
    if (ids.includes(kit.id)) {
      return true;
    }
    ids.forEach((id) => seenIds.add(id));
    ids = ids
      .flatMap((id) => kitsById.get(id)?.contains.map((contained) => contained.kitId) ?? [])
      .filter((id) => !seenIds.has(id) || id === kit.id);
  }
  return false;
}
