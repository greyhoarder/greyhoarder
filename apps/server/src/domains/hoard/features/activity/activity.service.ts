import { Injectable } from '@nestjs/common';
import { type Box, isOwnFaction, type Mini, type MiniStep } from '@greyhoarder/domain/hoard';
import type { ActivityResponse } from '@greyhoarder/protocol/hoard';
import { CatalogKitQueries } from '../../../catalog/api/index.js';
import { ownFactionNamesOf } from '../../models/own-faction-names.js';
import { HoardRepository } from '../../ports/hoard-repository.js';

type Entry = ActivityResponse['months'][number]['entries'][number];

/** The furthest first, as the lines of a month are listed. */
const STEP_ORDER = ['done', 'painted', 'primed', 'built'] as const;

/** What got done in a hoard (docs/use-cases/see-activity.md). */
@Injectable()
export class ActivityService {
  constructor(
    private readonly hoard: HoardRepository,
    private readonly catalog: CatalogKitQueries,
  ) {}

  async overview(ownerId: string): Promise<ActivityResponse> {
    const [steps, boxes, minis, ownFactions] = await Promise.all([
      this.hoard.findSteps(ownerId),
      this.hoard.findBoxes(ownerId),
      this.hoard.findMinis(ownerId),
      this.hoard.findOwnFactions(ownerId),
    ]);

    const catalogNames = await this.catalog.findFactionNames(
      [...new Set(minis.flatMap((mini) => mini.factionIds))].filter((id) => !isOwnFaction(id)),
    );

    const factionNames = new Map([...catalogNames, ...ownFactionNamesOf(minis, ownFactions)]);
    const stepCounts = new Map<string, number>();

    for (const { on } of steps) {
      stepCounts.set(on, (stepCounts.get(on) ?? 0) + 1);
    }

    const monthsWith = [...new Set([...steps.map((step) => step.on), ...boxes.map((box) => box.addedOn)])].map((day) =>
      day.slice(0, 7),
    );

    return {
      days: [...stepCounts]
        .map(([date, count]) => ({ date, steps: count }))
        .sort((a, b) => a.date.localeCompare(b.date)),
      months: [...new Set(monthsWith)]
        .sort((a, b) => b.localeCompare(a))
        .map((month) => ({ month, entries: monthEntries(month, steps, boxes, minis, factionNames) })),
    };
  }
}

function monthEntries(
  month: string,
  steps: readonly MiniStep[],
  boxes: readonly Box[],
  minis: readonly Mini[],
  factionNames: ReadonlyMap<string, string>,
): Entry[] {
  const inMonth = (day: string): boolean => day.startsWith(month);
  const minisById = new Map(minis.map((mini) => [mini.id, mini]));

  const stepEntries = STEP_ORDER.flatMap((kind): Entry | [] => {
    const reached = steps
      .filter((step) => step.status === kind && inMonth(step.on))
      .flatMap((step) => minisById.get(step.miniId) ?? []);

    return reached.length === 0
      ? []
      : {
          kind,
          count: reached.length,
          minis: reached.length,
          rows: armyRows(reached, factionNames),
        };
  });

  const added = boxes.filter((box) => inMonth(box.addedOn));

  if (added.length === 0) {
    return stepEntries;
  }

  const addedIds = new Set(added.map((box) => box.id));

  return [
    ...stepEntries,
    {
      kind: 'box',
      count: added.length,
      minis: minis.filter((mini) => mini.boxId !== undefined && addedIds.has(mini.boxId)).length,
      rows: added.map(({ id, name }) => ({
        id,
        name,
        minis: minis.filter((mini) => mini.boxId === id).length,
      })),
    },
  ];
}

/** The minis by their first faction, the most first. */
function armyRows(minis: readonly Mini[], factionNames: ReadonlyMap<string, string>): Entry['rows'][number][] {
  const counts = new Map<string, number>();

  for (const mini of minis) {
    const army = factionNames.get(mini.factionIds[0] ?? '') ?? 'No faction';
    counts.set(army, (counts.get(army) ?? 0) + 1);
  }

  return [...counts].map(([name, count]) => ({ name, minis: count })).sort((a, b) => b.minis - a.minis);
}
