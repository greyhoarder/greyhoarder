import type { Box, Mini, Part } from '@greyhoarder/domain/hoard';

/** The boxes and minis of each user's hoard; every method is scoped to one owner (ADR-0010). */
export abstract class HoardRepository {
  abstract findBoxes(ownerId: string): Promise<Box[]>;

  /** The oldest change first, so the latest built mini of a name comes last. */
  abstract findMinis(ownerId: string): Promise<Mini[]>;

  /** Those of the minis with these ids that belong to the owner. */
  abstract findMinisByIds(ownerId: string, ids: readonly string[]): Promise<Mini[]>;

  /** The owner's vocabulary of parts. */
  abstract findParts(ownerId: string): Promise<Part[]>;

  /** Stores the changed minis together with the parts they added to the vocabulary, all or nothing. */
  abstract updateMinis(ownerId: string, minis: readonly Mini[], newParts: readonly Part[]): Promise<void>;

  /** Stores the boxes together with their minis, all or nothing. */
  abstract addBoxes(ownerId: string, boxes: readonly Box[], minis: readonly Mini[]): Promise<void>;
}
