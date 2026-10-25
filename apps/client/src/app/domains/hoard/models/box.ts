import type { Box, Kit } from '@greyhoarder/domain/hoard';

/** Whether the box was added from the kit, whichever version of it. */
export function isFromKit(box: Box, kit: Kit): boolean {
  return box.kit?.id === kit.id;
}
