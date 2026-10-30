import { Injectable } from '@nestjs/common';
import { type CatalogMini, catalogMinisOf, type MiniSearchWord, relevanceOf } from '../../models/catalog-mini.js';
import { CatalogKitQueries } from '../../ports/catalog-kit-queries.js';

/** Enough to choose a mini; a narrower search finds the rest. */
const SEARCH_LIMIT = 50;
/** The kits the minis are taken from; far more than the minis of a search need. */
const KIT_LIMIT = 500;
/** The factions a word of a search can mean; far more than share a word. */
const FACTION_LIMIT = 100;

/** Catalog minis found by a search, with the names it takes to show them. */
export interface CatalogMiniSearchResult {
  readonly minis: readonly CatalogMini[];
  /** The names of the minis' factions and game systems, by id. */
  readonly factionNames: ReadonlyMap<string, string>;
  /** The names of the game systems of the minis' factions, by faction id. */
  readonly systemNames: ReadonlyMap<string, string>;
}

/** Finding the minis of the catalog, e.g. to add minis without their box; removed kits are not offered. */
@Injectable()
export class MinisService {
  constructor(private readonly catalog: CatalogKitQueries) {}

  /**
   * The minis for which every word of the text is in their name, the name of a kit they come from or
   * the name of their faction, e.g. "Ork Boy", one per kit; the best matches first, then by name, faction
   * and the newest kit.
   */
  async search(text: string): Promise<CatalogMiniSearchResult> {
    const words = await this.wordsOf(text);
    const kits = await this.catalog.searchKitsByMini(words, KIT_LIMIT);
    const minis = catalogMinisOf(kits, words);
    const factionIds = [...new Set(minis.flatMap((mini) => (mini.factionId === undefined ? [] : [mini.factionId])))];
    const [factionNames, systemNames] = await Promise.all([
      this.catalog.findFactionNames(factionIds),
      this.catalog.findSystemNames(factionIds),
    ]);
    const factionOf = (mini: CatalogMini) =>
      mini.factionId === undefined ? '' : (factionNames.get(mini.factionId) ?? mini.factionId);
    const sorted = [...minis]
      .sort(
        (a, b) =>
          relevanceOf(b, words) - relevanceOf(a, words) ||
          a.name.localeCompare(b.name) ||
          factionOf(a).localeCompare(factionOf(b)) ||
          // The newest kit first.
          (b.kit.year ?? 0) - (a.kit.year ?? 0) ||
          a.kit.name.localeCompare(b.kit.name),
      )
      .slice(0, SEARCH_LIMIT);
    return { minis: sorted, factionNames, systemNames };
  }

  /** The words of the text, each with the factions whose name contains it. */
  private async wordsOf(text: string): Promise<MiniSearchWord[]> {
    const words = text
      .trim()
      .split(/\s+/)
      .filter((word) => word !== '');
    return Promise.all(
      words.map(async (word) => ({
        text: word,
        factionIds: (await this.catalog.searchFactions(word, FACTION_LIMIT)).map((faction) => faction.id),
      })),
    );
  }
}
