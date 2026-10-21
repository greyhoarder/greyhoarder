import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
  USERNAME_PATTERN,
} from '@greyhoarder/domain/users';
import { z } from 'zod';

const usernameLengthError = `Use ${USERNAME_MIN_LENGTH} to ${USERNAME_MAX_LENGTH} characters.`;

/** The first administrator; the messages are shown below the affected field. */
export const setupRequestSchema = z.object({
  username: z
    .string()
    .trim()
    .min(USERNAME_MIN_LENGTH, { error: usernameLengthError })
    .max(USERNAME_MAX_LENGTH, { error: usernameLengthError })
    .regex(USERNAME_PATTERN, { error: 'Use only letters, digits, dots, underscores and hyphens.' }),
  password: z
    .string()
    .min(PASSWORD_MIN_LENGTH, { error: 'Enter a password.' })
    .max(PASSWORD_MAX_LENGTH, { error: `Use at most ${PASSWORD_MAX_LENGTH} characters.` }),
});

export type SetupRequest = z.infer<typeof setupRequestSchema>;

/** Whether the instance still needs its first administrator. */
export const setupStatusResponseSchema = z.object({
  required: z.boolean(),
});

export type SetupStatusResponse = z.infer<typeof setupStatusResponseSchema>;
