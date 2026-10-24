import { InvalidBoxCountError } from './invalid-box-count.error';
import { parseTags } from './tag';

/** What the user chose for the boxes they add from a kit: how many, and the tags they get. */
export interface BoxesToAdd {
  readonly boxes: number;
  readonly tags: readonly string[];
}

/** Adding always adds at least one box. */
export const MIN_BOXES = 1;

/**
 * A whole number of boxes, at least one, with their tags parsed.
 *
 * @throws InvalidBoxCountError for fewer than one or a fractional number of boxes
 */
export function parseBoxesToAdd(boxesToAdd: BoxesToAdd): BoxesToAdd {
  if (!Number.isInteger(boxesToAdd.boxes) || boxesToAdd.boxes < MIN_BOXES) {
    throw new InvalidBoxCountError(boxesToAdd.boxes);
  }
  return { boxes: boxesToAdd.boxes, tags: parseTags(boxesToAdd.tags) };
}
