import type { Box, Mini, OwnFaction, Part } from '@greyhoarder/domain/hoard';
import type { HoardChange } from '../models/hoard-change.js';

/** The boxes and minis of each user's hoard; every method is scoped to one owner (ADR-0010). */
export abstract class HoardRepository {
  abstract findBoxes(ownerId: string): Promise<Box[]>;

  /** The oldest change first, so the latest built mini of a name comes last. */
  abstract findMinis(ownerId: string): Promise<Mini[]>;

  /** Those of the minis with these ids that belong to the owner. */
  abstract findMinisByIds(ownerId: string, ids: readonly string[]): Promise<Mini[]>;

  /** The owner's vocabulary of parts. */
  abstract findParts(ownerId: string): Promise<Part[]>;

  /** The owner's own factions. */
  abstract findOwnFactions(ownerId: string): Promise<OwnFaction[]>;

  /**
   * Stores the change: the changed minis, the parts and factions they added and those they dropped.
   *
   * @throws NameTakenMeanwhileError when another change added a part or faction of the same name meanwhile
   */
  abstract updateMinis(ownerId: string, change: HoardChange): Promise<void>;

  /** Deletes the minis and stores the change it makes to other minis and the vocabulary, all or nothing. */
  abstract deleteMinis(ownerId: string, miniIds: readonly string[], change: HoardChange): Promise<void>;

  /**
   * Deletes the box with every mini it has at that moment, gone ones included, and stores the change
   * it makes to other minis and the vocabulary, all or nothing.
   *
   * @returns the ids of the deleted minis
   */
  abstract deleteBox(ownerId: string, boxId: string, change: HoardChange): Promise<string[]>;

  /**
   * Stores new minis together with the parts and own factions they added, all or nothing.
   *
   * @throws NameTakenMeanwhileError when another change added a part or faction of the same name meanwhile
   */
  abstract addMinis(
    ownerId: string,
    minis: readonly Mini[],
    added: Pick<HoardChange, 'newParts' | 'newFactions'>,
  ): Promise<void>;

  /** Stores the boxes together with their minis, all or nothing. */
  abstract addBoxes(ownerId: string, boxes: readonly Box[], minis: readonly Mini[]): Promise<void>;
}
