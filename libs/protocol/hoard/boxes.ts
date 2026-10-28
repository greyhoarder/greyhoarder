import { z } from 'zod';

/** ISO date, e.g. "2026-10-12". */
export const isoDateSchema = z.iso.date();

/** The catalog kit a box or a mini was added from, as `BoxKitReference` describes it. */
export const kitReferenceSchema = z.object({
  id: z.string(),
  version: z.number().int(),
  name: z.string(),
  sku: z.string().optional(),
});

/** A box as `Box` describes it. */
export const boxSchema = z.object({
  id: z.string(),
  name: z.string(),
  kit: kitReferenceSchema.optional(),
  factionIds: z.array(z.string()).readonly(),
  tags: z.array(z.string()).readonly(),
  addedOn: isoDateSchema,
  number: z.number().int().min(1),
});

/** Every box of the signed-in user's hoard. */
export const boxesResponseSchema = z.object({
  boxes: z.array(boxSchema).readonly(),
  /** The names of the catalog factions the boxes refer to, by id. */
  factionNames: z.record(z.string(), z.string()),
});

export type BoxesResponse = z.infer<typeof boxesResponseSchema>;
