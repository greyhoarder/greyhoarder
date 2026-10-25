import type { Box, Mini } from '@greyhoarder/domain/hoard';

/** The boxes and minis of each user's hoard; every method is scoped to one owner (ADR-0010). */
export abstract class HoardRepository {
  abstract findBoxes(ownerId: string): Promise<Box[]>;

  abstract findMinis(ownerId: string): Promise<Mini[]>;

  /** Stores the boxes together with their minis, all or nothing. */
  abstract addBoxes(ownerId: string, boxes: readonly Box[], minis: readonly Mini[]): Promise<void>;
}
