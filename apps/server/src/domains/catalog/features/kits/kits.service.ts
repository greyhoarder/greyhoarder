import { Injectable } from '@nestjs/common';
import type { CatalogKit } from '@greyhoarder/domain/catalog';
import { CatalogKitQueries } from '../../ports/catalog-kit-queries.js';

/** Enough to choose a kit; a narrower search finds the rest. */
const SEARCH_LIMIT = 50;

export interface KitSearchResult {
  readonly kits: readonly CatalogKit[];
  /** Every kit the found kits contain, also within contained bundles, so their minis can be added. */
  readonly containedKits: readonly CatalogKit[];
  /** The names of the factions and whole game systems the kits and their slots are listed for, by id. */
  readonly factionNames: ReadonlyMap<string, string>;
}

/** Finding catalog kits to add a box from; removed kits are no longer offered (ADR-0020). */
@Injectable()
export class KitsService {
  constructor(private readonly catalog: CatalogKitQueries) {}

  async search(text: string): Promise<KitSearchResult> {
    const kits = await this.catalog.searchKits(text, SEARCH_LIMIT);
    const containedKits = await this.findContainedKits(kits);
    const factionIds = [...new Set([...kits, ...containedKits].flatMap(factionIdsOf))];
    const factionNames = await this.catalog.findFactionNames(factionIds);
    return { kits, containedKits, factionNames };
  }

  /** A contained kit that is no longer offered still belongs to the bundles that contain it. */
  private async findContainedKits(kits: readonly CatalogKit[]): Promise<CatalogKit[]> {
    const knownIds = new Set(kits.map((kit) => kit.id));
    const containedKits: CatalogKit[] = [];
    let ids = unknownContainedIds(kits, knownIds);
    while (ids.length > 0) {
      const found = await this.catalog.findKits(ids);
      ids.forEach((id) => knownIds.add(id));
      containedKits.push(...found);
      ids = unknownContainedIds(found, knownIds);
    }
    return containedKits;
  }
}

function unknownContainedIds(kits: readonly CatalogKit[], knownIds: ReadonlySet<string>): string[] {
  return [...new Set(kits.flatMap((kit) => kit.contains.map((contained) => contained.kitId)))].filter(
    (id) => !knownIds.has(id),
  );
}

function factionIdsOf(kit: CatalogKit): string[] {
  return [...kit.factionIds, ...kit.variants.flatMap((variant) => variant.slots.flatMap((slot) => slot.factionIds))];
}
