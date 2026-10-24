import { z } from 'zod';

const kitReleaseSchema = z.object({
  year: z.number().int().optional(),
  sku: z.string().optional(),
  barcode: z.string().optional(),
});

const kitSlotSchema = z.object({
  count: z.number().int(),
  buildsAs: z.array(z.string()).readonly(),
  parts: z.array(z.string()).readonly(),
  factionIds: z.array(z.string()).readonly(),
});

const kitVariantSchema = z.object({
  name: z.string(),
  slots: z.array(kitSlotSchema).readonly(),
});

const containedKitSchema = z.object({
  kitId: z.string(),
  count: z.number().int(),
});

/** A catalog kit as `CatalogKit` describes it, with the version a box added from it records. */
const catalogKitSchema = z.object({
  version: z.number().int(),
  id: z.string(),
  manufacturer: z.string(),
  name: z.string(),
  factionIds: z.array(z.string()).readonly(),
  releases: z.array(kitReleaseSchema).readonly(),
  minis: z.number().int(),
  isDraft: z.boolean(),
  supersedesId: z.string().optional(),
  contains: z.array(containedKitSchema).readonly(),
  variants: z.array(kitVariantSchema).readonly(),
});

/** Searching the catalog by name, product code or barcode. */
export const kitSearchRequestSchema = z.object({
  search: z.string().trim().min(1).max(100),
});

export type KitSearchRequest = z.infer<typeof kitSearchRequestSchema>;

export const kitSearchResponseSchema = z.object({
  kits: z.array(catalogKitSchema).readonly(),
  /** Every kit the found kits contain, also within contained bundles. */
  containedKits: z.array(catalogKitSchema).readonly(),
  /** The names of the factions and whole game systems the kits and their slots are listed for, by id. */
  factionNames: z.record(z.string(), z.string()),
});

export type KitSearchResponse = z.infer<typeof kitSearchResponseSchema>;
