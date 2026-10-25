import { hobbyStatuses } from '@greyhoarder/domain/hoard';
import { z } from 'zod';

/** A mini as `Mini` describes it. */
export const miniSchema = z.object({
  id: z.string(),
  name: z.string(),
  factionIds: z.array(z.string()).readonly(),
  status: z.enum(hobbyStatuses),
  parts: z.array(z.string()).readonly(),
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
