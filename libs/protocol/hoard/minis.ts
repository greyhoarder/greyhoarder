import { departureReasons, hobbyStatuses } from '@greyhoarder/domain/hoard';
import { z } from 'zod';
import { isoDateSchema, kitReferenceSchema } from './boxes.js';

/** A part on a mini as `MiniPart` describes it. */
const miniPartSchema = z.object({
  partId: z.string(),
  isSwappable: z.boolean(),
});

/** How a mini left the hoard, as `Departure` describes it. */
const departureSchema = z.object({
  reason: z.enum(departureReasons),
  on: isoDateSchema,
  recipientMiniIds: z.array(z.string().min(1)).readonly().optional(),
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
  kit: kitReferenceSchema.optional(),
  isOnWorkbench: z.boolean(),
  departure: departureSchema.optional(),
});

/** Every mini of the signed-in user's hoard. */
export const minisResponseSchema = z.object({
  minis: z.array(miniSchema).readonly(),
  /** The names of the factions the minis refer to, by id: catalog factions and the user's own. */
  factionNames: z.record(z.string(), z.string()),
  /** The names of the game systems of those factions, by faction id. */
  systemNames: z.record(z.string(), z.string()),
  /**
   * The catalog faction each of those factions is part of, up the whole chain, by faction id; the
   * factions of the chain are named in `factionNames` and `systemNames` as well.
   */
  partOf: z.record(z.string(), z.string()),
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

/**
 * A faction to give minis: a catalog faction or one of the user's own by its id, or a name, which the
 * server finds among the user's own factions or adds to them.
 */
const factionChangeSchema = z.union([
  z.object({ id: z.string().min(1) }),
  z.object({ name: z.string().trim().min(1).max(100) }),
]);

/** Changes that apply to every given mini alike, e.g. a row of alike minis or the minis being built. */
export const updateMinisRequestSchema = z.object({
  ids: z.array(z.string().min(1)).min(1).readonly(),
  set: z.object({
    name: z.string().trim().min(1).max(100).optional(),
    status: z.enum(hobbyStatuses).optional(),
    factions: z.array(factionChangeSchema).readonly().optional(),
    parts: z.array(partChangeSchema).readonly().optional(),
    notes: z.string().max(5000).optional(),
    isOnWorkbench: z.boolean().optional(),
    /** A departure lets the minis leave the hoard; `null` brings them back. */
    departure: departureSchema.nullable().optional(),
  }),
});

export type UpdateMinisRequest = z.infer<typeof updateMinisRequestSchema>;

export const updateMinisResponseSchema = z.object({
  minis: z.array(miniSchema).readonly(),
  /** The names of the user's own factions the minis carry, by id, also those the change added. */
  ownFactionNames: z.record(z.string(), z.string()),
});

export type UpdateMinisResponse = z.infer<typeof updateMinisResponseSchema>;

/** Alike minis to add without a box: from the catalog or put together by the user. */
export const addMinisRequestSchema = z.object({
  name: z.string().trim().min(1).max(100),
  /** The catalog kit the minis come from, in the version the search found; none for the user's own. */
  kit: z.object({ id: z.string().min(1), version: z.number().int().min(1) }).optional(),
  factions: z.array(factionChangeSchema).readonly(),
  status: z.enum(hobbyStatuses),
  parts: z.array(partChangeSchema).readonly(),
  notes: z.string().max(5000).optional(),
  count: z.number().int().min(1).max(100),
});

export type AddMinisRequest = z.infer<typeof addMinisRequestSchema>;

export const addMinisResponseSchema = z.object({
  minis: z.array(miniSchema).readonly(),
});

export type AddMinisResponse = z.infer<typeof addMinisResponseSchema>;

/** Minis to delete for good. */
export const deleteMinisRequestSchema = z.object({
  ids: z.array(z.string().min(1)).min(1).readonly(),
});

export type DeleteMinisRequest = z.infer<typeof deleteMinisRequestSchema>;

export const deleteMinisResponseSchema = z.object({
  /** The boxes left without any minis, gone ones included; they stay until deleted on their own. */
  emptiedBoxIds: z.array(z.string()).readonly(),
  /** Other minis whose recipients lost the deleted ones. */
  minis: z.array(miniSchema).readonly(),
});

export type DeleteMinisResponse = z.infer<typeof deleteMinisResponseSchema>;
