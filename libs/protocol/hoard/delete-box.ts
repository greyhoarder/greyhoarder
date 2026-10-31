import { z } from 'zod';
import { miniSchema } from './minis.js';

/** Deleting a box for good, with all its minis or keeping those past the sprue without a box. */
export const deleteBoxRequestSchema = z.object({
  /** "true" keeps the minis past the sprue; the minis on the sprue always go with the box. */
  keepBuiltMinis: z
    .enum(['true', 'false'])
    .optional()
    .transform((keep) => keep === 'true'),
});

export type DeleteBoxRequest = z.input<typeof deleteBoxRequestSchema>;

/** What deleting a box for good took with it. */
export const deleteBoxResponseSchema = z.object({
  /** The box's minis deleted with it, gone ones included. */
  deletedMiniIds: z.array(z.string()).readonly(),
  /** Other minis that changed: kept minis now without a box, and those whose recipients lost deleted ones. */
  minis: z.array(miniSchema).readonly(),
});

export type DeleteBoxResponse = z.infer<typeof deleteBoxResponseSchema>;
