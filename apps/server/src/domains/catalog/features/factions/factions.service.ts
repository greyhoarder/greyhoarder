import { Injectable } from '@nestjs/common';
import { CatalogKitQueries } from '../../ports/catalog-kit-queries.js';

/** Enough to choose a faction; a narrower search finds the rest. */
const SEARCH_LIMIT = 50;

/** A catalog faction as a search offers it. */
export interface FoundFaction {
  readonly id: string;
  readonly name: string;
  readonly systemName: string;
}

/** Finding catalog factions, e.g. to give them to minis; removed factions are not offered. */
@Injectable()
export class FactionsService {
  constructor(private readonly catalog: CatalogKitQueries) {}

  /** The factions whose name contains the text, sorted by name, each with its game system. */
  async search(text: string): Promise<FoundFaction[]> {
    const factions = await this.catalog.searchFactions(text, SEARCH_LIMIT);
    const systemNames = await this.catalog.findSystemNames(factions.map((faction) => faction.id));
    return factions.map((faction) => ({
      id: faction.id,
      name: faction.name,
      systemName: systemNames.get(faction.id) ?? faction.systemId,
    }));
  }
}
