import { PASSWORD_MAX_LENGTH } from '@greyhoarder/domain/users';
import { z } from 'zod';
import { passwordSchema } from './setup.js';

/** Replacing the signed-in user's password. */
export const changePasswordRequestSchema = z.object({
  currentPassword: z.string().min(1).max(PASSWORD_MAX_LENGTH),
  newPassword: passwordSchema,
});

export type ChangePasswordRequest = z.infer<typeof changePasswordRequestSchema>;
