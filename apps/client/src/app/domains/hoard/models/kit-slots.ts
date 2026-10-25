import type { Kit, KitSlot } from '@greyhoarder/domain/hoard';

/** Every slot of every variant of the kit, kits in it included, in the kit's order. */
export function slotsOf(kit: Kit): KitSlot[] {
  return [
    ...kit.variants.flatMap((variant) => variant.slots),
    ...kit.contains.flatMap(({ kit: contained }) => slotsOf(contained)),
  ];
}
