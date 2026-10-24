import { EmptyBoxError } from './empty-box.error';
import type { BoxesToAdd } from './boxes-to-add';
import type { BoxRow } from './box-row';
import { boxKitName } from './kit';
import { factionNamesOf } from './kit-labels';
import { sprueMinis } from './sprue-minis';
import type { Kit } from './kit';
import type { MiniRow } from './mini-row';

/**
 * One box per box counted, each with the minis its kit puts on the sprue (docs/domains/hoard.md).
 *
 * @throws EmptyBoxError when the kit puts no minis on the sprue
 */
export function newBoxes(
  kit: Kit,
  boxesToAdd: BoxesToAdd,
  context: {
    readonly addedOn: string;
    readonly newId: () => string;
    /** Rows show factions by name; those without a known name are left out. */
    readonly factionNames: ReadonlyMap<string, string>;
  },
): { boxes: BoxRow[]; minis: MiniRow[] } {
  const { addedOn, newId, factionNames } = context;
  const name = boxKitName(kit);
  const kinds = sprueMinis(kit);
  const count = kinds.reduce((sum, kind) => sum + kind.count, 0);
  if (count === 0) {
    throw new EmptyBoxError();
  }
  const boxes: BoxRow[] = [];
  const minis: MiniRow[] = [];
  for (let index = 0; index < boxesToAdd.boxes; index++) {
    boxes.push({
      id: newId(),
      name,
      kit: { name, sku: kit.sku },
      factions: factionNamesOf(kit.factionIds, factionNames),
      minis: { sprue: count },
      addedOn,
      tags: boxesToAdd.tags,
    });
    for (const kind of kinds) {
      minis.push({
        id: newId(),
        name: kind.name,
        factions: factionNamesOf(kind.factionIds.length > 0 ? kind.factionIds : kit.factionIds.slice(0, 1), factionNames),
        box: name,
        parts: [],
        status: 'sprue',
        isOnWorkbench: false,
        count: kind.count,
      });
    }
  }
  return { boxes, minis };
}

/** Today as an ISO date in the user's time zone, e.g. "2026-10-23". */
export function today(): string {
  const now = new Date();
  const pad = (value: number) => value.toString().padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}
