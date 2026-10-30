import { findPart, type MiniPart, type Part } from '@greyhoarder/domain/hoard';
import { UnknownPartError } from './errors/unknown-part.error.js';

/** A part to put on minis: one of the vocabulary by its id, or a name. */
export type PartChange =
  { readonly partId: string; readonly isSwappable: boolean } | { readonly name: string; readonly isSwappable: boolean };

/**
 * The parts as parts of the vocabulary. A name refers to the part with that name or alias, or to a
 * new part, one per name however often it is given; a part from a kit becomes one of the vocabulary
 * this way when it is first used (docs/domains/hoard.md, Parts).
 *
 * @throws UnknownPartError when an id is not in the vocabulary
 */
export function resolveParts(
  vocabulary: readonly Part[],
  changes: readonly PartChange[],
  newId: () => string,
): { parts: MiniPart[]; newParts: Part[] } {
  const newParts: Part[] = [];
  const parts: MiniPart[] = [];
  for (const change of changes) {
    if ('partId' in change) {
      if (!vocabulary.some((known) => known.id === change.partId)) {
        throw new UnknownPartError();
      }
      parts.push({ partId: change.partId, isSwappable: change.isSwappable });
      continue;
    }
    let known = findPart([...vocabulary, ...newParts], change.name);
    if (!known) {
      known = { id: newId(), name: change.name.trim(), aliases: [] };
      newParts.push(known);
    }
    parts.push({ partId: known.id, isSwappable: change.isSwappable });
  }
  const unique = parts.filter((part, index) => parts.findIndex((other) => other.partId === part.partId) === index);
  return { parts: unique, newParts };
}
