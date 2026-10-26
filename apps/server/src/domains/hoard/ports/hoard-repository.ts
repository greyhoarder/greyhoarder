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
  abstract updateMinis(
    ownerId: string,
    minis: readonly Mini[],
    newParts: readonly Part[],
  ): Promise<void>;

  /** Deletes the minis and stores the other minis changed by it, all or nothing. */
  abstract deleteMinis(
    ownerId: string,
    miniIds: readonly string[],
    changed: readonly Mini[],
  ): Promise<void>;

  /**
   * Deletes the box with every mini it has at that moment, gone ones included, and stores the other
   * minis changed by it, all or nothing.
   *
   * @returns the ids of the deleted minis
   */
  abstract deleteBox(ownerId: string, boxId: string, changed: readonly Mini[]): Promise<string[]>;

  /** Stores the boxes together with their minis, all or nothing. */
  abstract addBoxes(ownerId: string, boxes: readonly Box[], minis: readonly Mini[]): Promise<void>;
}
