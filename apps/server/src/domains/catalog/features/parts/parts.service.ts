import { Injectable } from '@nestjs/common';
import { CatalogKitQueries } from '../../ports/catalog-kit-queries.js';

/** The parts of a range: what the catalog kits of factions offer, e.g. to put on a mini of them. */
@Injectable()
export class PartsService {
  constructor(private readonly catalog: CatalogKitQueries) {}

  /**
   * Every part the catalog kits of the factions and of every faction they are part of offer, up the
   * whole chain, sorted by name: a Dark Angels mini gets the parts of Space Marines kits as well.
   */
  async rangeParts(factionIds: readonly string[]): Promise<string[]> {
    const lineage = new Set<string>();
    let next = [...new Set(factionIds)];
    while (next.length > 0) {
      next.forEach((id) => lineage.add(id));
      const factions = await this.catalog.findFactions(next);
      next = factions.flatMap((faction) =>
        faction.partOfId === undefined || lineage.has(faction.partOfId) ? [] : [faction.partOfId],
      );
    }
    const parts = await this.catalog.findKitParts([...lineage]);
    return parts.sort((a, b) => a.localeCompare(b));
  }
}
