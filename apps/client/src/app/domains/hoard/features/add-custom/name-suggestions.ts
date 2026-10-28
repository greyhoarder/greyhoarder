import type { Mini } from '@greyhoarder/domain/hoard';
import type { CatalogMiniSearchResult } from '../../../catalog/api';
import type { NameSuggestion } from './name-field/name-field';

/** Enough to choose from; a longer name narrows the rest. */
const SUGGESTION_LIMIT = 10;

/** The names of the hoard's minis that contain the text, ignoring case, each once and sorted. */
export function ownNameSuggestions(hoard: readonly Mini[], text: string): NameSuggestion[] {
  const needle = text.trim().toLowerCase();
  if (needle === '') {
    return [];
  }
  return [...new Set(hoard.map((mini) => mini.name))]
    .filter((name) => name.toLowerCase().includes(needle))
    .sort((a, b) => a.localeCompare(b))
    .slice(0, SUGGESTION_LIMIT)
    .map((name) => ({ name }));
}

/** The catalog minis whose own name contains the text, ignoring case, each with its faction. */
export function catalogNameSuggestions(
  result: CatalogMiniSearchResult,
  text: string,
): NameSuggestion[] {
  const needle = text.trim().toLowerCase();
  return result.minis
    .filter((mini) => mini.name.toLowerCase().includes(needle))
    .slice(0, SUGGESTION_LIMIT)
    .map((mini) => {
      const faction = mini.factionId && (result.factionNames.get(mini.factionId) ?? mini.factionId);
      return faction ? { name: mini.name, detail: faction } : { name: mini.name };
    });
}
