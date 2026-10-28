import { type HobbyStatus, type Mini, type MiniPart, parseMini } from '@greyhoarder/domain/hoard';

/** Alike minis to add without a box, from the catalog or put together by the user. */
export interface LooseMinis {
  readonly name: string;
  readonly factionIds: readonly string[];
  readonly status: HobbyStatus;
  readonly parts: readonly MiniPart[];
  readonly notes?: string;
  readonly count: number;
}

/**
 * As many minis as counted, without a box and off the workbench (docs/domains/hoard.md, Minis);
 * each a mini by the rules.
 *
 * @throws InvalidMiniError for an empty name
 */
export function looseMinis(minis: LooseMinis, newId: () => string): Mini[] {
  const { count, notes, ...alike } = minis;
  return Array.from({ length: count }, () =>
    parseMini({ id: newId(), ...alike, ...(notes ? { notes } : {}), isOnWorkbench: false }),
  );
}
