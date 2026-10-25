import { MIN_BOXES } from '@greyhoarder/domain/hoard';
import { z } from 'zod';
import { boxSchema, isoDateSchema } from './boxes.js';
import { miniSchema } from './minis.js';

/** Boxes of a catalog kit, each with the minis it puts on the sprue; the server picks the kit's latest version. */
export const addBoxesRequestSchema = z.object({
  kitId: z.string().min(1),
  boxes: z.number().int().min(MIN_BOXES),
  tags: z.array(z.string()).readonly(),
  /** The user's today, which may differ from the server's. */
  addedOn: isoDateSchema,
});

export type AddBoxesRequest = z.infer<typeof addBoxesRequestSchema>;

export const addBoxesResponseSchema = z.object({
  boxes: z.array(boxSchema).readonly(),
  minis: z.array(miniSchema).readonly(),
});

export type AddBoxesResponse = z.infer<typeof addBoxesResponseSchema>;
