import { z } from 'zod';
import { miniSchema } from './minis.js';

/** Boxes to delete for good, with all their minis or keeping those past the sprue without a box. */
export const deleteBoxesRequestSchema = z.object({
  ids: z.array(z.string().min(1)).min(1).readonly(),
  /** Keeps the minis past the sprue; the minis on the sprue always go with the boxes. */
  keepBuiltMinis: z.boolean().optional(),
});

export type DeleteBoxesRequest = z.infer<typeof deleteBoxesRequestSchema>;

/** What deleting boxes for good took with them. */
export const deleteBoxesResponseSchema = z.object({
  /** The boxes' minis deleted with them, gone ones included. */
  deletedMiniIds: z.array(z.string()).readonly(),
  /** Other minis that changed: kept minis now without a box, and those whose recipients lost deleted ones. */
  minis: z.array(miniSchema).readonly(),
});

export type DeleteBoxesResponse = z.infer<typeof deleteBoxesResponseSchema>;
