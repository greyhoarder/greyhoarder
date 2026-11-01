import { setAvatarRequestSchema } from '@greyhoarder/protocol/auth';
import { createZodDto } from 'nestjs-zod';

export class SetAvatarRequestDto extends createZodDto(setAvatarRequestSchema) {}
