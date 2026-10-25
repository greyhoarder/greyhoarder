import type { Box } from './box.js';
import { EmptyBoxError } from './errors/empty-box.error.js';
import { boxKitName, type Kit } from './kit.js';
import { type Mini, parseMini } from './mini.js';
import { sprueMinis } from './sprue-minis.js';

/** Adding always adds at least one box. */
export const MIN_BOXES = 1;

/**
 * One box per box counted, each with one mini on the sprue per mini its kit yields
 * (docs/domains/hoard.md).
 *
 * @throws EmptyBoxError when the kit puts no minis on the sprue
 */
export function newBoxes(
  kit: Kit,
  boxesToAdd: { readonly boxes: number; readonly tags: readonly string[] },
  context: { readonly addedOn: string; readonly newId: () => string },
): { boxes: Box[]; minis: Mini[] } {
  const { addedOn, newId } = context;
  const name = boxKitName(kit);
  const kinds = sprueMinis(kit);
  if (kinds.every((kind) => kind.count === 0)) {
    throw new EmptyBoxError();
  }
  const boxes: Box[] = [];
  const minis: Mini[] = [];
  for (let index = 0; index < boxesToAdd.boxes; index++) {
    const box: Box = {
      id: newId(),
      name,
      kit: { id: kit.id, version: kit.version, name, sku: kit.sku },
      factionIds: kit.factionIds,
      tags: boxesToAdd.tags,
      addedOn,
    };
    boxes.push(box);
    for (const kind of kinds) {
      const factionIds = kind.factionIds.length > 0 ? kind.factionIds : kit.factionIds.slice(0, 1);
      for (let mini = 0; mini < kind.count; mini++) {
        minis.push(
          parseMini({
            id: newId(),
            name: kind.name,
            factionIds,
            status: 'sprue',
            parts: [],
            boxId: box.id,
            isOnWorkbench: false,
          }),
        );
      }
    }
  }
  return { boxes, minis };
}
