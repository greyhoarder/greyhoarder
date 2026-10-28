import type { Mini, Part } from '@greyhoarder/domain/hoard';

/** What a change of minis stores, all or nothing. */
export interface HoardChange {
  /** The minis as they are to be stored. */
  readonly changed: readonly Mini[];
  /** The parts the change added to the vocabulary. */
  readonly newParts?: readonly Part[];
  /** The terms the change took off minis (`droppedParts`); deleted unless a mini still carries them. */
  readonly droppedPartIds: readonly string[];
}
