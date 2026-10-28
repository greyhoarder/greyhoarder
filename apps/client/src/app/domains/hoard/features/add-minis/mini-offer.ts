import { isGone, type Mini } from '@greyhoarder/domain/hoard';
import type { CatalogMini, CatalogMiniSearchResult } from '../../../catalog/api';
import { catalogMiniKey, factionText, kitsText } from './catalog-mini-labels';

/** A catalog mini as its card offers it to be added. */
export interface MiniOffer {
  readonly mini: CatalogMini;
  /** Tells the cards apart. */
  readonly key: string;
  /** "{faction} · {game system}". */
  readonly faction: string;
  /** The faction's name alone, e.g. "Orks". */
  readonly factionName?: string;
  /** The kits it comes from, e.g. "Boyz · 2026, Nobz · 2009". */
  readonly kits: string;
  /** Minis of the hoard with this name, ignoring case, and faction that are not gone. */
  readonly owned: number;
}

/** The found catalog minis as cards, each with how many of it the hoard already has. */
export function toMiniOffers(result: CatalogMiniSearchResult, hoard: readonly Mini[]): MiniOffer[] {
  const owned = ownedCounts(hoard);
  const { factionNames, systemNames } = result;
  return result.minis.map((mini) => {
    const offer = {
      mini,
      key: catalogMiniKey(mini),
      faction: factionText(mini, factionNames, systemNames),
      kits: kitsText(mini),
      owned: owned.get(ownedKey(mini.name, mini.factionId)) ?? 0,
    };
    return mini.factionId === undefined
      ? offer
      : { ...offer, factionName: factionNames.get(mini.factionId) ?? mini.factionId };
  });
}

/** How many minis that are not gone have each name per faction; minis without a faction count for none. */
function ownedCounts(hoard: readonly Mini[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const mini of hoard.filter((owned) => !isGone(owned))) {
    const factionIds = mini.factionIds.length > 0 ? mini.factionIds : [undefined];
    for (const key of factionIds.map((factionId) => ownedKey(mini.name, factionId))) {
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }
  return counts;
}

function ownedKey(name: string, factionId: string | undefined): string {
  return `${name.toLowerCase()}\n${factionId ?? ''}`;
}
