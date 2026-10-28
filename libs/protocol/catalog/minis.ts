import { z } from 'zod';

/** Searching the minis of the catalog by their name or the name of a kit they come from. */
export const catalogMiniSearchRequestSchema = z.object({
  search: z.string().trim().min(1).max(100),
});

export type CatalogMiniSearchRequest = z.infer<typeof catalogMiniSearchRequestSchema>;

/** A kit a catalog mini comes from. */
const miniKitSchema = z.object({
  id: z.string(),
  name: z.string(),
  /** The year of its oldest release, if known. */
  year: z.number().int().optional(),
  isDraft: z.boolean(),
});

/** A name slots of catalog kits can be built as, for one faction. */
const catalogMiniSchema = z.object({
  name: z.string(),
  /** Left out for minis of kits without a game system. */
  factionId: z.string().optional(),
  /** What the slots offer, each once, in the order they first come. */
  parts: z.array(z.string()).readonly(),
  kits: z.array(miniKitSchema).readonly(),
});

export const catalogMiniSearchResponseSchema = z.object({
  minis: z.array(catalogMiniSchema).readonly(),
  /** The names of the minis' factions and game systems, by id. */
  factionNames: z.record(z.string(), z.string()),
  /** The names of the game systems of the minis' factions, by faction id. */
  systemNames: z.record(z.string(), z.string()),
});

export type CatalogMiniSearchResponse = z.infer<typeof catalogMiniSearchResponseSchema>;
