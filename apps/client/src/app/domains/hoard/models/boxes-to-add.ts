import { EmptyBoxError, MIN_BOXES, parseRowCounts, parseTags } from '@greyhoarder/domain/hoard';
import { InvalidBoxCountError } from './invalid-box-count.error';
import { MissingBoxNameError } from './missing-box-name.error';

/** What the user chose for the boxes they add from a kit: how many, their name, minis and tags. */
export interface BoxesToAdd {
  readonly boxes: number;
  readonly tags: readonly string[];
  /** By default the kit's name with its year. */
  readonly name?: string;
  /** Minis per box for each row of the kit (`sprueMinis`); by default as the kit describes. */
  readonly rows?: readonly number[];
  /** Sprues bought without their box, always an edited box. */
  readonly areSprues?: boolean;
}

/**
 * A whole number of boxes, at least one, with a name if given, rows of whole numbers of minis
 * that put at least one mini on the sprue if given, and their tags parsed.
 *
 * @throws InvalidBoxCountError for fewer than one or a fractional number of boxes
 * @throws MissingBoxNameError for a name of nothing but blanks
 * @throws InvalidRowsError for a row with fewer than no or a fractional number of minis
 * @throws EmptyBoxError for rows that put no mini on the sprue
 */
export function parseBoxesToAdd(boxesToAdd: BoxesToAdd): BoxesToAdd {
  const { boxes, tags, name, rows } = boxesToAdd;
  if (!Number.isInteger(boxes) || boxes < MIN_BOXES) {
    throw new InvalidBoxCountError(boxes);
  }
  if (name?.trim() === '') {
    throw new MissingBoxNameError();
  }
  if (rows && parseRowCounts(rows).every((count) => count === 0)) {
    throw new EmptyBoxError();
  }
  return { ...boxesToAdd, tags: parseTags(tags), name: name?.trim() };
}
