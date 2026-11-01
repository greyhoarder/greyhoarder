import { languages, userRoles } from '@greyhoarder/domain/users';
import { z } from 'zod';

export const loginRequestSchema = z.object({
  username: z.string().trim().min(1).max(64),
  password: z.string().min(1).max(256),
  keepSignedIn: z.boolean().default(false),
});

export type LoginRequest = z.infer<typeof loginRequestSchema>;

/** The signed-in user; never more than the client needs. */
export const sessionResponseSchema = z.object({
  user: z.object({
    id: z.string(),
    username: z.string(),
    role: z.enum(userRoles),
    displayName: z.string().optional(),
    language: z.enum(languages).optional(),
    avatarId: z.string().optional(),
  }),
});

export type SessionResponse = z.infer<typeof sessionResponseSchema>;
