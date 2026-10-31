import { z } from 'zod';
import { boxSchema } from './boxes.js';
import { miniSchema } from './minis.js';

/** The minis on the sprue of a box counted anew, per row of the kit version it records (`sprueMinis`). */
export const editBoxRowsRequestSchema = z.object({
  rows: z.array(z.number().int().min(0)).readonly(),
});

export type EditBoxRowsRequest = z.infer<typeof editBoxRowsRequestSchema>;

export const editBoxRowsResponseSchema = z.object({
  box: boxSchema,
  /** Minis put on the sprue of raised rows. */
  addedMinis: z.array(miniSchema).readonly(),
  /** Minis on the sprue of lowered rows, deleted for good. */
  deletedMiniIds: z.array(z.string()).readonly(),
  /** Other minis that no longer name a deleted mini as a recipient of their parts. */
  minis: z.array(miniSchema).readonly(),
});

export type EditBoxRowsResponse = z.infer<typeof editBoxRowsResponseSchema>;
