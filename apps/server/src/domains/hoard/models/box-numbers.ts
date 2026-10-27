import type { Box } from '@greyhoarder/domain/hoard';

/**
 * The number of the next box with this name: the highest of its name plus one, 1 for the first
 * (docs/domains/hoard.md, Boxes and kits).
 */
export function nextBoxNumber(boxes: readonly Box[], name: string): number {
  return Math.max(0, ...boxes.filter((box) => box.name === name).map((box) => box.number)) + 1;
}
