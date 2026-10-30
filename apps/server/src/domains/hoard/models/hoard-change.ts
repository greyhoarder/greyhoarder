import type { Mini, OwnFaction, Part } from '@greyhoarder/domain/hoard';

/** What a change of minis stores, all or nothing. */
export interface HoardChange {
  /** The minis as they are to be stored. */
  readonly changed: readonly Mini[];
  /** The parts the change added to the vocabulary. */
  readonly newParts?: readonly Part[];
  /** The own factions the change added. */
  readonly newFactions?: readonly OwnFaction[];
  /** The terms the change took off minis (`droppedParts`); deleted unless a mini still carries them. */
  readonly droppedPartIds: readonly string[];
  /** The own factions the change took off minis (`droppedFactions`); deleted unless a mini still carries them. */
  readonly droppedFactionIds: readonly string[];
}
