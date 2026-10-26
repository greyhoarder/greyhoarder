import { z } from 'zod';
import { miniSchema } from './minis.js';

/** What deleting a box for good took with it. */
export const deleteBoxResponseSchema = z.object({
  /** The box's minis, gone ones included, deleted with it. */
  deletedMiniIds: z.array(z.string()).readonly(),
  /** Other minis whose recipients lost the deleted ones. */
  minis: z.array(miniSchema).readonly(),
});

export type DeleteBoxResponse = z.infer<typeof deleteBoxResponseSchema>;
