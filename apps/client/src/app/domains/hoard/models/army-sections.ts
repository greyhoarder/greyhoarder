import { type Kit, sprueMinis, type SprueMinis } from '@greyhoarder/domain/hoard';

export const NO_FACTION = 'No faction';

/** The minis of one army of a box or kit (docs/use-cases/see-the-armies-of-a-box.md). */
export interface ArmySection<T> {
  readonly army: string;
  readonly items: readonly T[];
}

/** A row of a kit with its place among the kit's rows. */
export interface KitRow {
  readonly kind: SprueMinis;
  readonly index: number;
}

/** The items by army: the armies in the given order, others by name, those without an army last. */
export function armySections<T>(
  items: readonly T[],
  armyOf: (item: T) => string | undefined,
  order: readonly string[],
): ArmySection<T>[] {
  const sections = new Map<string, T[]>();
  for (const item of items) {
    const army = armyOf(item) ?? NO_FACTION;
    sections.set(army, [...(sections.get(army) ?? []), item]);
  }
  const rank = (army: string): number => {
    const place = order.indexOf(army);
    return army === NO_FACTION ? order.length + 1 : place === -1 ? order.length : place;
  };
  return [...sections.entries()]
    .map(([army, armyItems]) => ({ army, items: armyItems }))
    .sort((a, b) => rank(a.army) - rank(b.army) || a.army.localeCompare(b.army));
}

/** The rows of a kit by army; a row without a faction of its own belongs to the kit's first faction. */
export function kitSections(kit: Kit, factionNames: ReadonlyMap<string, string>): ArmySection<KitRow>[] {
  const firstFaction = kit.factionIds[0];
  return armySections(
    sprueMinis(kit).map((kind, index) => ({ kind, index })),
    ({ kind }) => {
      const factionId = kind.factionIds[0] ?? firstFaction;
      return factionId === undefined ? undefined : factionNames.get(factionId);
    },
    kit.factionIds.flatMap((id) => factionNames.get(id) ?? []),
  );
}

/** "Orks", "Orks and Tau", "Orks, Tau and Eldar". */
export function armiesText(armies: readonly string[]): string {
  const last = armies.at(-1) ?? '';
  return armies.length < 2 ? last : `${armies.slice(0, -1).join(', ')} and ${last}`;
}
