import type { Box, Mini } from '@greyhoarder/domain/hoard';

/** The minis of a box being deleted: those deleted with it and those staying in the hoard without a box. */
export interface MinisOfDeletedBox {
  readonly deleted: readonly Mini[];
  /** As they are to be stored: without a box, with the box's kit as their kit. */
  readonly kept: readonly Mini[];
}

/**
 * Deleting a box deletes all its minis, gone ones included, or when the minis past the sprue are
 * kept, only those on the sprue (docs/domains/hoard.md, Boxes and kits).
 */
export function boxDeletion(
  box: Box,
  minisOfBox: readonly Mini[],
  options: { readonly keepBuiltMinis: boolean },
): MinisOfDeletedBox {
  if (!options.keepBuiltMinis) {
    return { deleted: minisOfBox, kept: [] };
  }

  return {
    deleted: minisOfBox.filter((mini) => mini.status === 'sprue'),
    kept: minisOfBox.filter((mini) => mini.status !== 'sprue').map((mini) => withoutBox(mini, box)),
  };
}

function withoutBox(mini: Mini, box: Box): Mini {
  const { boxId: _boxId, ...rest } = mini;

  return box.kit === undefined ? rest : { ...rest, kit: box.kit };
}
