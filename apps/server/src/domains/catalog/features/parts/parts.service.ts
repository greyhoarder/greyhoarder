import { Injectable } from '@nestjs/common';
import { CatalogKitQueries } from '../../ports/catalog-kit-queries.js';
import { findFactionLineage } from '../../util/faction-lineage.js';

/** The parts of a range: what the catalog kits of factions offer, e.g. to put on a mini of them. */
@Injectable()
export class PartsService {
  constructor(private readonly catalog: CatalogKitQueries) {}

  /**
   * Every part the catalog kits of the factions and of every faction they are part of offer, up the
   * whole chain, sorted by name: a Dark Angels mini gets the parts of Space Marines kits as well.
   */
  async rangeParts(factionIds: readonly string[]): Promise<string[]> {
    const partOf = await findFactionLineage(factionIds, (ids) => this.catalog.findFactions(ids));
    const lineage = new Set([...factionIds, ...partOf.values()]);
    const parts = await this.catalog.findKitParts([...lineage]);
    return parts.sort((a, b) => a.localeCompare(b));
  }
}
