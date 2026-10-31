import type { Kit } from './kit.js';
import { sprueMinis } from './sprue-minis.js';

/**
 * The rows of a kit, kits in it included, whose minis can be built as a name containing the search,
 * ignoring case: those a kit was found by when searching for a model on its sprues.
 */
export function matchingRows(kit: Kit, search: string): number[] {
  const text = search.trim().toLowerCase();
  if (text === '') {
    return [];
  }
  return sprueMinis(kit).flatMap((row, index) =>
    row.builds.some((name) => name.toLowerCase().includes(text)) ? [index] : [],
  );
}
