import { userRoles } from '@greyhoarder/domain/users';
import { z } from 'zod';
import { passwordSchema, usernameSchema } from './setup.js';

const accountSchema = z.object({
  id: z.string(),
  username: z.string(),
  role: z.enum(userRoles),
  disabled: z.boolean(),
  displayName: z.string().optional(),
  avatarId: z.string().optional(),
  createdAt: z.string().optional(),
  lastLoginAt: z.string().optional(),
});

/** An account as an administrator sees it. */
export const accountResponseSchema = accountSchema;

export type AccountResponse = z.infer<typeof accountResponseSchema>;

/** The accounts of the instance, for administrators. */
export const accountsResponseSchema = z.object({ users: z.array(accountSchema) });

export type AccountsResponse = z.infer<typeof accountsResponseSchema>;

/** What an administrator changes on an account. */
export const updateAccountRequestSchema = z.object({
  role: z.enum(userRoles).optional(),
  disabled: z.boolean().optional(),
});

export type UpdateAccountRequest = z.infer<typeof updateAccountRequestSchema>;

/** The new password an administrator sets for an account. */
export const setPasswordRequestSchema = z.object({ password: passwordSchema });

export type SetPasswordRequest = z.infer<typeof setPasswordRequestSchema>;

/** A further account; its first password is handed over outside the app. */
export const addAccountRequestSchema = z.object({
  username: usernameSchema,
  role: z.enum(userRoles),
  password: passwordSchema,
});

export type AddAccountRequest = z.infer<typeof addAccountRequestSchema>;
