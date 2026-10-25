import { Injectable } from '@nestjs/common';
import type { CatalogKit } from '@greyhoarder/domain/catalog';
import type { VersionedEntry } from '../../models/versioned-entry.js';
import { CatalogKitQueries } from '../../ports/catalog-kit-queries.js';
import { findContainedKits } from '../../util/contained-kits.js';

/** Enough to choose a kit; a narrower search finds the rest. */
const SEARCH_LIMIT = 50;

export interface KitSearchResult {
  /** With their versions, which boxes added from them record. */
  readonly kits: readonly VersionedEntry<CatalogKit>[];
  /** Every kit the found kits contain, also within contained bundles, so their minis can be added. */
  readonly containedKits: readonly VersionedEntry<CatalogKit>[];
  /** The names of the factions and whole game systems the kits and their slots are listed for, by id. */
  readonly factionNames: ReadonlyMap<string, string>;
}

/** Finding catalog kits to add a box from; removed kits are no longer offered (ADR-0020). */
@Injectable()
export class KitsService {
  constructor(private readonly catalog: CatalogKitQueries) {}

  async search(text: string): Promise<KitSearchResult> {
    const kits = await this.catalog.searchKits(text, SEARCH_LIMIT);
    const containedKits = await findContainedKits(kits, (ids) => this.catalog.findKits(ids));
    const factionIds = [...new Set([...kits, ...containedKits].flatMap(({ entry }) => factionIdsOf(entry)))];
    const factionNames = await this.catalog.findFactionNames(factionIds);
    return { kits, containedKits, factionNames };
  }
}

function factionIdsOf(kit: CatalogKit): string[] {
  return [...kit.factionIds, ...kit.variants.flatMap((variant) => variant.slots.flatMap((slot) => slot.factionIds))];
}
