import { z } from 'zod';

// The file format of the catalog repository as described in its README. Fields this
// release does not know are dropped, so a newer catalog still loads.

const idSchema = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/);

/** `factions/<system>.yaml` */
export const systemFileSchema = z.object({
  name: z.string().min(1),
  groups: z.record(idSchema, z.string().min(1)).default({}),
  factions: z.record(
    idSchema,
    z.object({ name: z.string().min(1), group: idSchema.optional(), partOf: idSchema.optional() }),
  ),
});

/** `kits/<manufacturer>/<folder>/<kit>.yaml` */
export const kitFileSchema = z.object({
  name: z.string().min(1),
  factions: z.array(z.string().min(1)).default([]),
  releases: z
    .array(
      z.object({
        year: z.number().int().optional(),
        sku: z.string().min(1).optional(),
        barcode: z.string().regex(/^\d+$/).optional(),
      }),
    )
    .default([]),
  minis: z.number().int().positive(),
  draft: z.boolean().default(false),
  supersedes: z.string().min(1).optional(),
  contains: z.array(z.object({ kit: z.string().min(1), count: z.number().int().positive() })).default([]),
  variants: z
    .array(
      z.object({
        name: z.string().min(1),
        slots: z.array(
          z.object({
            count: z.number().int().positive(),
            buildsAs: z.array(z.string().min(1)).min(1),
            parts: z.array(z.string().min(1)).default([]),
            factions: z.array(z.string().min(1)).default([]),
          }),
        ),
      }),
    )
    .default([]),
});
