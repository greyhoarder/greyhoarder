import { z } from 'zod';

/** A part of the vocabulary as `Part` describes it, and whether a catalog kit offers a part of its name. */
const partTermSchema = z.object({
  id: z.string(),
  name: z.string(),
  aliases: z.array(z.string()).readonly(),
  isFromCatalog: z.boolean(),
});

/** The signed-in user's vocabulary of parts. */
export const partsResponseSchema = z.object({
  parts: z.array(partTermSchema).readonly(),
});

export type PartsResponse = z.infer<typeof partsResponseSchema>;
