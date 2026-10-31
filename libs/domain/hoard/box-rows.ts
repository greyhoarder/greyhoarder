import type { Box } from './box.js';
import type { Kit } from './kit.js';
import type { Mini } from './mini.js';
import { isGone } from './mini-departure.js';
import { parseRows, rowMinis } from './new-box.js';
import { sprueMinis } from './sprue-minis.js';

/**
 * The minis on the sprue of a box that are not gone, by row of its kit. Rows named as a mini's sprue
 * name take it in the kit's order, each up to what it puts on the sprue; the last of them takes the
 * rest. Minis of no row are left out.
 */
function sprueMinisByRow(kit: Kit, minis: readonly Mini[]): Mini[][] {
  const rows = sprueMinis(kit);
  const byRow = rows.map((): Mini[] => []);
  for (const mini of minis) {
    if (mini.status !== 'sprue' || isGone(mini)) {
      continue;
    }
    const name = mini.sprueName ?? mini.name;
    const named = rows.flatMap((kind, index) => (kind.name === name ? [index] : []));
    const row = named.find((index) => (byRow[index]?.length ?? 0) < (rows[index]?.count ?? 0)) ?? named.at(-1);
    if (row !== undefined) {
      byRow[row]?.push(mini);
    }
  }
  return byRow;
}

/** How many minis of a box are on the sprue in each row of its kit (docs/domains/hoard.md, Boxes and kits). */
export function sprueRowCounts(kit: Kit, minis: readonly Mini[]): number[] {
  return sprueMinisByRow(kit, minis).map((row) => row.length);
}

/**
 * A box with its minis on the sprue counted anew, row by row of its kit: more puts further minis on
 * the sprue as adding the box would, fewer deletes minis on the sprue of that row; built and gone
 * minis stay. A changed box is an edited box.
 *
 * @throws InvalidRowsError when the rows do not fit the kit
 */
export function editedRows(
  kit: Kit,
  box: Box,
  minis: readonly Mini[],
  counted: readonly number[],
  newId: () => string,
): { box: Box; added: Mini[]; deletedIds: string[] } {
  const rows = parseRows(kit, counted);
  const kinds = sprueMinis(kit);
  const added: Mini[] = [];
  const deletedIds: string[] = [];
  sprueMinisByRow(kit, minis).forEach((current, row) => {
    const count = rows[row] ?? 0;
    const kind = kinds[row];
    if (count > current.length && kind) {
      added.push(...rowMinis(kit, kind, box.id, count - current.length, newId));
    }
    deletedIds.push(...current.slice(count).map((mini) => mini.id));
  });
  const isChanged = added.length > 0 || deletedIds.length > 0;
  return { box: isChanged && box.areSprues !== true ? { ...box, isEdited: true } : box, added, deletedIds };
}
