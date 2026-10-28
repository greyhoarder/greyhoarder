import type { Kit } from '@greyhoarder/domain/hoard';

/**
 * A kit of one slot that builds the name with the parts, so the part picker offers the parts the
 * catalog suggests for a mini without a box first, as it does those of a box's kit; none without
 * parts.
 */
export function suggestionKit(name: string, parts: readonly string[]): Kit | undefined {
  if (parts.length === 0) {
    return undefined;
  }
  const slot = { count: 1, names: [name], parts, factionIds: [] };
  return {
    id: '',
    version: 0,
    name,
    names: [name],
    manufacturer: '',
    factionIds: [],
    isDraft: false,
    variants: [{ name, slots: [slot], minis: 1 }],
    minis: 1,
    contains: [],
  };
}
