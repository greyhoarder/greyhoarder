import { MIN_BOXES } from '@greyhoarder/domain/hoard';
import { z } from 'zod';
import { boxSchema, isoDateSchema } from './boxes.js';
import { miniSchema } from './minis.js';

/**
 * Boxes of a catalog kit, each with the minis of the counted rows on the sprue; the server picks the
 * kit's latest version. Without rows, each box gets the minis its kit puts on the sprue.
 */
export const addBoxesRequestSchema = z.object({
  kitId: z.string().min(1),
  boxes: z.number().int().min(MIN_BOXES),
  tags: z.array(z.string()).readonly(),
  /** The user's today, which may differ from the server's. */
  addedOn: isoDateSchema,
  /** By default the kit's name with its year. */
  name: z.string().trim().min(1).max(200).optional(),
  /** Minis per box for each row of the kit's latest version, in its order (`sprueMinis`). */
  rows: z.array(z.number().int().min(0)).readonly().optional(),
  /** Sprues bought without their box: always an edited box. */
  areSprues: z.boolean().optional(),
});

export type AddBoxesRequest = z.infer<typeof addBoxesRequestSchema>;

export const addBoxesResponseSchema = z.object({
  boxes: z.array(boxSchema).readonly(),
  minis: z.array(miniSchema).readonly(),
});

export type AddBoxesResponse = z.infer<typeof addBoxesResponseSchema>;
