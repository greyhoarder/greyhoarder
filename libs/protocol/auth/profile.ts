import { AVATAR_MAX_BYTES, DISPLAY_NAME_MAX_LENGTH, languages } from '@greyhoarder/domain/users';
import { z } from 'zod';

/** What changes on the signed-in user's profile; an empty display name removes it. */
export const updateProfileRequestSchema = z.object({
  displayName: z.string().trim().max(DISPLAY_NAME_MAX_LENGTH).optional(),
  language: z.enum(languages).optional(),
});

export type UpdateProfileRequest = z.infer<typeof updateProfileRequestSchema>;

/** The picture as a JPEG in Base64; JSON keeps uploads free of a multipart parser. */
export const setAvatarRequestSchema = z.object({
  image: z
    .base64()
    .max(Math.ceil(AVATAR_MAX_BYTES / 3) * 4)
    .min(1),
});

export type SetAvatarRequest = z.infer<typeof setAvatarRequestSchema>;
