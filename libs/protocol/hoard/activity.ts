import { z } from 'zod';
import { isoDateSchema } from './boxes.js';

/** The last year of a hoard: the days with steps and what happened month by month, newest first. */
export const activityResponseSchema = z.object({
  days: z.array(z.object({ date: isoDateSchema, steps: z.number().int().min(1) })).readonly(),
  months: z
    .array(
      z.object({
        /** E.g. "2026-11". */
        month: z.string(),
        entries: z
          .array(
            z.object({
              kind: z.enum(['built', 'primed', 'painted', 'done', 'box']),
              /** How many minis, or boxes for `box`. */
              count: z.number().int(),
              /** How many minis, also for `box`. */
              minis: z.number().int(),
              /** The names of the armies of the minis; empty for `box`. */
              factions: z.array(z.string()).readonly(),
              items: z.array(z.object({ id: z.string(), name: z.string() })).readonly(),
            }),
          )
          .readonly(),
      }),
    )
    .readonly(),
});

export type ActivityResponse = z.infer<typeof activityResponseSchema>;
