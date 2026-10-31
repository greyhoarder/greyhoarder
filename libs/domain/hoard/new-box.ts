import type { Box } from './box.js';
import { EmptyBoxError } from './errors/empty-box.error.js';
import { InvalidRowsError } from './errors/invalid-rows.error.js';
import { boxKitName, type Kit, kitName, kitReferenceOf } from './kit.js';
import { type Mini, parseMini } from './mini.js';
import { type SprueMinis, sprueMinis } from './sprue-minis.js';

/** Adding always adds at least one box. */
export const MIN_BOXES = 1;

/** What the user chose for the boxes to add (docs/domains/hoard.md, Boxes and kits). */
export interface BoxesOfKit {
  readonly boxes: number;
  readonly tags: readonly string[];
  /** By default the kit's name with its year. */
  readonly name?: string;
  /** How many minis each row of the kit puts on the sprue of every box; by default as the kit describes. */
  readonly rows?: readonly number[];
  /** Sprues bought without their box, always an edited box. */
  readonly areSprues?: boolean;
}

/**
 * Counts of minis per row: whole numbers, none or more.
 *
 * @throws InvalidRowsError otherwise
 */
export function parseRowCounts(rows: readonly number[]): readonly number[] {
  if (rows.some((count) => !Number.isInteger(count) || count < 0)) {
    throw new InvalidRowsError();
  }
  return rows;
}

/**
 * Counts of minis for each row the kit puts on the sprue (`sprueMinis`), in its order.
 *
 * @throws InvalidRowsError when they do not fit the kit
 */
export function parseRows(kit: Kit, rows: readonly number[]): readonly number[] {
  if (rows.length !== sprueMinis(kit).length) {
    throw new InvalidRowsError();
  }
  return parseRowCounts(rows);
}

/** How many minis each row of the kit puts on the sprue, as the kit describes. */
export function kitRowCounts(kit: Kit): number[] {
  return sprueMinis(kit).map((row) => row.count);
}

/** Whether rows counted for the kit differ from what the kit puts on the sprue. */
export function differFromKit(kit: Kit, rows: readonly number[]): boolean {
  const counts = kitRowCounts(kit);
  return rows.length !== counts.length || rows.some((count, index) => count !== counts[index]);
}

/** The name a box of sprues gets at first, e.g. "Boyz sprues (2026)". */
export function sprueBoxName(kit: Kit): string {
  const name = `${kitName(kit)} sprues`;
  return kit.year === undefined ? name : `${name} (${kit.year})`;
}

/**
 * One box per box counted, each with the minis of the counted rows on the sprue, as many per row as
 * its kit puts there unless counted otherwise (docs/domains/hoard.md).
 *
 * @throws EmptyBoxError when the rows put no minis on the sprue
 * @throws InvalidRowsError when the rows do not fit the kit
 */
export function newBoxes(
  kit: Kit,
  boxesToAdd: BoxesOfKit,
  context: {
    readonly addedOn: string;
    readonly newId: () => string;
    /** The number of the first new box; the others follow it. */
    readonly firstNumber?: number;
  },
): { boxes: Box[]; minis: Mini[] } {
  const { addedOn, newId, firstNumber = 1 } = context;
  const name = boxesToAdd.name?.trim() || boxKitName(kit);
  const kinds = sprueMinis(kit);
  const rows = parseRows(kit, boxesToAdd.rows ?? kinds.map((kind) => kind.count));
  if (rows.every((count) => count === 0)) {
    throw new EmptyBoxError();
  }
  const areSprues = boxesToAdd.areSprues === true;
  const isEdited = !areSprues && differFromKit(kit, rows);
  const boxes: Box[] = [];
  const minis: Mini[] = [];
  for (let index = 0; index < boxesToAdd.boxes; index++) {
    const box: Box = {
      id: newId(),
      name,
      kit: kitReferenceOf(kit),
      factionIds: kit.factionIds,
      tags: boxesToAdd.tags,
      addedOn,
      number: firstNumber + index,
      ...(isEdited ? { isEdited } : {}),
      ...(areSprues ? { areSprues } : {}),
    };
    boxes.push(box);
    kinds.forEach((kind, row) => minis.push(...rowMinis(kit, kind, box.id, rows[row] ?? 0, newId)));
  }
  return { boxes, minis };
}

/** Minis of one row put on the sprue of a box, named after the row, with its factions or else the kit's first one. */
export function rowMinis(kit: Kit, row: SprueMinis, boxId: string, count: number, newId: () => string): Mini[] {
  const factionIds = row.factionIds.length > 0 ? row.factionIds : kit.factionIds.slice(0, 1);
  return Array.from({ length: count }, () =>
    parseMini({
      id: newId(),
      name: row.name,
      factionIds,
      status: 'sprue',
      parts: [],
      sprueName: row.name,
      boxId,
      isOnWorkbench: false,
    }),
  );
}
