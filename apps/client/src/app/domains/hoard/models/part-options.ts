import { findPart, type Kit, type Part, partKey } from '@greyhoarder/domain/hoard';
import { sprueOffer } from './kit-slots';

/** A part the picker offers: one of the vocabulary, or a catalog part not yet in it. */
export interface PartOption {
  readonly name: string;
  /** Left out for a catalog part that is not yet in the vocabulary. */
  readonly partId?: string;
  /** The alias the filter matched, when it matched no name. */
  readonly alias?: string;
}

export interface PartOptions {
  readonly fromKit: readonly PartOption[];
  readonly fromVocabulary: readonly PartOption[];
  /** Parts of the catalog kits of the minis' range, only while filtering, at most `RANGE_LIMIT`. */
  readonly fromRange: readonly PartOption[];
  /** The filter text, when it names no part exactly and can become a part of the user's own. */
  readonly create?: string;
}

/** Enough to pick from; a longer filter narrows the rest. */
export const RANGE_LIMIT = 20;

/**
 * What the part picker offers for a filter text (docs/screens/mini.md): the parts the kit offers for
 * the minis' sprue name first, then
 * the rest of the vocabulary by name, and while filtering the parts of the range not offered above;
 * never the parts the minis already carry. A part matches when its name or an alias contains the
 * text, ignoring case.
 */
export function partOptions(
  parts: {
    /** The kit of the minis' box; left out when they have none. */
    readonly kit?: Kit;
    /** Offers the kit's parts for minis with this sprue name only. */
    readonly sprueName?: string;
    readonly vocabulary: readonly Part[];
    readonly range: readonly string[];
    readonly carried: readonly string[];
  },
  filter: string,
): PartOptions {
  const { vocabulary, carried } = parts;
  const needle = partKey(filter);
  const isCarried = (name: string) => carried.some((part) => partKey(part) === partKey(name));
  const asOption = (name: string) => {
    const known = findPart(vocabulary, name);
    return known
      ? { name: known.name, partId: known.id, aliases: known.aliases }
      : { name, aliases: [] };
  };
  const matching = (
    option: PartOption & { readonly aliases: readonly string[] },
  ): PartOption | undefined => {
    const { aliases, ...part } = option;
    if (needle === '' || partKey(part.name).includes(needle)) {
      return part;
    }
    const alias = aliases.find((candidate) => partKey(candidate).includes(needle));
    return alias === undefined ? undefined : { ...part, alias };
  };

  const kitParts = parts.kit ? sprueOffer(parts.kit, parts.sprueName).parts : [];
  const kitOptions = kitParts.map(asOption);
  const fromKit = kitOptions
    .filter((part) => !isCarried(part.name))
    .flatMap((part) => matching(part) ?? []);
  const fromVocabulary = vocabulary
    .filter(
      (known) => !kitOptions.some((part) => part.partId === known.id) && !isCarried(known.name),
    )
    .map((known) => ({ name: known.name, partId: known.id, aliases: known.aliases }))
    .sort((a, b) => a.name.localeCompare(b.name))
    .flatMap((part) => matching(part) ?? []);
  const isOffered = (name: string) =>
    [...kitOptions, ...vocabulary].some((part) => partKey(part.name) === partKey(name)) ||
    findPart(vocabulary, name) !== undefined;
  const fromRange =
    needle === ''
      ? []
      : parts.range
          .filter((name) => !isOffered(name) && !isCarried(name) && partKey(name).includes(needle))
          .slice(0, RANGE_LIMIT)
          .map((name) => ({ name }));
  const isKnown =
    findPart(vocabulary, filter) !== undefined ||
    [...kitParts, ...parts.range, ...carried].some((name) => partKey(name) === needle);
  return {
    fromKit,
    fromVocabulary,
    fromRange,
    ...(needle !== '' && !isKnown ? { create: filter.trim() } : {}),
  };
}
