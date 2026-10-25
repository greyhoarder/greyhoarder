import { z } from 'zod';

/** The parts of a range: the factions, comma-separated, e.g. `warhammer-40000/orks`. */
export const rangePartsRequestSchema = z.object({
  factionIds: z
    .string()
    .max(1000)
    .transform((ids) => ids.split(',').filter((id) => id !== ''))
    .pipe(z.array(z.string()).min(1)),
});

export type RangePartsRequest = z.input<typeof rangePartsRequestSchema>;

/** Every part the catalog kits of the factions and the factions they are part of offer, by name. */
export const rangePartsResponseSchema = z.object({
  parts: z.array(z.string()).readonly(),
});

export type RangePartsResponse = z.infer<typeof rangePartsResponseSchema>;
