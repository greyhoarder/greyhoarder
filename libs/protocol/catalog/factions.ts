import { z } from 'zod';

/** Searching the catalog factions by name. */
export const factionSearchRequestSchema = z.object({
  search: z.string().trim().min(1).max(100),
});

export type FactionSearchRequest = z.infer<typeof factionSearchRequestSchema>;

const factionSchema = z.object({
  /** `<system>/<faction>`, e.g. "warhammer-40000/orks". */
  id: z.string(),
  name: z.string(),
  systemName: z.string(),
});

export const factionSearchResponseSchema = z.object({
  factions: z.array(factionSchema).readonly(),
});

export type FactionSearchResponse = z.infer<typeof factionSearchResponseSchema>;
