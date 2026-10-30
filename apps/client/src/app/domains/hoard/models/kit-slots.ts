import { type Kit, type KitSlot, sprueMinis } from '@greyhoarder/domain/hoard';

/** Every slot of every variant of the kit, kits in it included, in the kit's order. */
export function slotsOf(kit: Kit): KitSlot[] {
  return [
    ...kit.variants.flatMap((variant) => variant.slots),
    ...kit.contains.flatMap(({ kit: contained }) => slotsOf(contained)),
  ];
}

/**
 * What minis with the sprue name can be built as and the parts they come with, as a box of the kit
 * put them on the sprue, each once in the kit's order; every name and part of the kit when it put
 * none with that name there.
 */
export function sprueOffer(kit: Kit, sprueName: string | undefined): { names: string[]; parts: string[] } {
  const minis = sprueMinis(kit).filter((kind) => kind.name === sprueName);
  const slots = minis.length > 0 ? minis.map((kind) => ({ names: kind.builds, parts: kind.parts })) : slotsOf(kit);
  return {
    names: [...new Set(slots.flatMap((slot) => slot.names))],
    parts: [...new Set(slots.flatMap((slot) => slot.parts))],
  };
}
