import type { BoxRow } from './box-row';
import { boxKitName, sprueMinis } from './kit-facts';
import type { KitOption } from './kit-option';
import type { MiniRow } from './mini-row';

/** What the user chose for the boxes they add from a kit. */
export interface BoxChoice {
  readonly boxes: number;
  readonly tags: readonly string[];
}

/**
 * One box per box counted, each with the minis its kit puts on the sprue (docs/domains/hoard.md).
 */
export function newBoxes(
  kit: KitOption,
  choice: BoxChoice,
  addedOn: string,
  newId: () => string,
): { boxes: BoxRow[]; minis: MiniRow[] } {
  const name = boxKitName(kit);
  const kinds = sprueMinis(kit);
  const boxes: BoxRow[] = [];
  const minis: MiniRow[] = [];
  for (let index = 0; index < choice.boxes; index++) {
    const count = kinds.reduce((sum, kind) => sum + kind.count, 0);
    boxes.push({
      id: newId(),
      name,
      kit: { name, sku: kit.sku },
      factions: kit.factions,
      minis: count > 0 ? { sprue: count } : {},
      addedOn,
      tags: choice.tags,
    });
    for (const kind of kinds) {
      minis.push({
        id: newId(),
        name: kind.name,
        factions: kind.factions.length > 0 ? kind.factions : kit.factions.slice(0, 1),
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
