import { type Part, partKey } from '@greyhoarder/domain/hoard';

/** A term of the vocabulary, and whether a catalog kit offers a part of its name (docs/domains/hoard.md, Parts). */
export interface VocabularyPart extends Part {
  readonly isFromCatalog: boolean;
}

/** The terms, each telling whether its name is one of the part names the catalog offers. */
export function withCatalogOrigin(parts: readonly Part[], offeredNames: readonly string[]): VocabularyPart[] {
  const offered = new Set(offeredNames.map(partKey));
  return parts.map((part) => ({ ...part, isFromCatalog: offered.has(partKey(part.name)) }));
}
