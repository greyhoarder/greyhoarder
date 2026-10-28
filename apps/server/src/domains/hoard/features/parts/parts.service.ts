import { Injectable } from '@nestjs/common';
import { CatalogKitQueries } from '../../../catalog/api/index.js';
import { type VocabularyPart, withCatalogOrigin } from '../../models/vocabulary-part.js';
import { HoardRepository } from '../../ports/hoard-repository.js';

/** The signed-in user's vocabulary of parts (docs/domains/hoard.md, Parts). */
@Injectable()
export class PartsService {
  constructor(
    private readonly hoard: HoardRepository,
    private readonly catalog: CatalogKitQueries,
  ) {}

  /** Each term tells whether it comes from the catalog, so the user's own can be told apart. */
  async list(ownerId: string): Promise<VocabularyPart[]> {
    const parts = await this.hoard.findParts(ownerId);
    const offered = await this.catalog.findOfferedPartNames(parts.map((part) => part.name));
    return withCatalogOrigin(parts, offered);
  }
}
