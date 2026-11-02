import { Injectable } from '@nestjs/common';
import type { CatalogKit } from '@greyhoarder/domain/catalog';
import type { VersionedEntry } from '../../models/versioned-entry.js';
import { CatalogKitQueries } from '../../ports/catalog-kit-queries.js';
import { findContainedKits } from '../../util/contained-kits.js';

/** Enough to choose a kit; a narrower search finds the rest. */
const SEARCH_LIMIT = 50;

/** Kits found in the catalog, with what it takes to show them and add boxes from them. */
export interface KitSearchResult {
  /** With their versions, which boxes added from them record. */
  readonly kits: readonly VersionedEntry<CatalogKit>[];
  /** Every kit the found kits contain, also within contained bundles, so their minis can be added. */
  readonly containedKits: readonly VersionedEntry<CatalogKit>[];
  /** The names of the factions and whole game systems the kits and their slots are listed for, by id. */
  readonly factionNames: ReadonlyMap<string, string>;
}

/**
 * Finding catalog kits to add a box from, where removed kits are no longer offered (ADR-0020),
 * and the kit a box was added from, as it was then.
 */
@Injectable()
export class KitsService {
  constructor(private readonly catalog: CatalogKitQueries) {}

  /**
   * The kits found by their name, a variant, product code, barcode or a name their slots can be
   * built as, and the bundles containing kits whose slots match, also through nested bundles.
   */
  async search(text: string): Promise<KitSearchResult> {
    const [found, bundles] = await Promise.all([
      this.catalog.searchKits(text, SEARCH_LIMIT),
      this.findBundlesBuildableAs(text),
    ]);

    const byId = new Map([...found, ...bundles].map((kit) => [kit.entry.id, kit]));

    const kits = [...byId.values()]
      .filter((kit) => !kit.isRemoved)
      .sort((a, b) => compare(a.entry.name, b.entry.name) || compare(a.entry.id, b.entry.id))
      .slice(0, SEARCH_LIMIT);

    return this.withContainedKits(kits);
  }

  /** Every bundle that contains a kit with a slot buildable as the text, also within contained bundles; removed ones included. */
  private async findBundlesBuildableAs(text: string): Promise<VersionedEntry<CatalogKit>[]> {
    const knownIds = new Set(await this.catalog.findKitIdsBuildableAs(text));
    const bundles: VersionedEntry<CatalogKit>[] = [];
    let ids = [...knownIds];

    while (ids.length > 0) {
      const found = (await this.catalog.findBundlesContaining(ids)).filter(({ entry }) => !knownIds.has(entry.id));
      found.forEach(({ entry }) => knownIds.add(entry.id));
      bundles.push(...found);
      ids = found.map(({ entry }) => entry.id);
    }

    return bundles;
  }

  /** This version of the kit, also when it was removed later; no kit when there is no such version. */
  async find(id: string, version: number): Promise<KitSearchResult> {
    const kit = await this.catalog.findKitVersion(id, version);

    return this.withContainedKits(kit === undefined ? [] : [kit]);
  }

  private async withContainedKits(kits: readonly VersionedEntry<CatalogKit>[]): Promise<KitSearchResult> {
    const containedKits = await findContainedKits(kits, (ids) => this.catalog.findKits(ids));
    const factionIds = [...new Set([...kits, ...containedKits].flatMap(({ entry }) => factionIdsOf(entry)))];
    const factionNames = await this.catalog.findFactionNames(factionIds);

    return { kits, containedKits, factionNames };
  }
}

/** Orders like the catalog's own sorting by name: by code unit, not by locale. */
function compare(a: string, b: string): number {
  if (a === b) {
    return 0;
  }

  return a < b ? -1 : 1;
}

function factionIdsOf(kit: CatalogKit): string[] {
  return [...kit.factionIds, ...kit.variants.flatMap((variant) => variant.slots.flatMap((slot) => slot.factionIds))];
}
