import { hobbyStatuses } from '@greyhoarder/domain/hoard';
import { z } from 'zod';

/** A part on a mini as `MiniPart` describes it. */
const miniPartSchema = z.object({
  partId: z.string(),
  isSwappable: z.boolean(),
});

/** A mini as `Mini` describes it. */
export const miniSchema = z.object({
  id: z.string(),
  name: z.string(),
  factionIds: z.array(z.string()).readonly(),
  status: z.enum(hobbyStatuses),
  parts: z.array(miniPartSchema).readonly(),
  notes: z.string().optional(),
  sprueName: z.string().optional(),
  boxId: z.string().optional(),
  isOnWorkbench: z.boolean(),
});

/** Every mini of the signed-in user's hoard. */
export const minisResponseSchema = z.object({
  minis: z.array(miniSchema).readonly(),
  /** The names of the catalog factions the minis refer to, by id. */
  factionNames: z.record(z.string(), z.string()),
  /** The names of the game systems of those factions, by faction id. */
  systemNames: z.record(z.string(), z.string()),
});

export type MinisResponse = z.infer<typeof minisResponseSchema>;

/**
 * A part to put on minis: one of the user's vocabulary by its id, or a name, which the server
 * finds in the vocabulary by name or alias, or adds to it.
 */
const partChangeSchema = z.union([
  miniPartSchema,
  z.object({ name: z.string().trim().min(1).max(100), isSwappable: z.boolean() }),
]);

/** Changes that apply to every given mini alike, e.g. a row of alike minis or the minis being built. */
export const updateMinisRequestSchema = z.object({
  ids: z.array(z.string().min(1)).min(1).readonly(),
  set: z.object({
    name: z.string().trim().min(1).max(100).optional(),
    status: z.enum(hobbyStatuses).optional(),
    factionIds: z.array(z.string()).readonly().optional(),
    parts: z.array(partChangeSchema).readonly().optional(),
    notes: z.string().max(5000).optional(),
    isOnWorkbench: z.boolean().optional(),
  }),
});

export type UpdateMinisRequest = z.infer<typeof updateMinisRequestSchema>;

export const updateMinisResponseSchema = z.object({
  minis: z.array(miniSchema).readonly(),
});

export type UpdateMinisResponse = z.infer<typeof updateMinisResponseSchema>;
