import type { Mini } from '@greyhoarder/domain/hoard';

/**
 * The ids of the terms the minis carried before a change and no longer carry after it; deleted
 * minis carry none after it. Those terms leave the vocabulary unless another mini still carries
 * them (docs/domains/hoard.md, Parts).
 */
export function droppedParts(before: readonly Mini[], after: readonly Mini[]): string[] {
  const kept = new Set(after.flatMap((mini) => mini.parts.map((part) => part.partId)));
  const carried = new Set(before.flatMap((mini) => mini.parts.map((part) => part.partId)));
  return [...carried].filter((partId) => !kept.has(partId));
}
