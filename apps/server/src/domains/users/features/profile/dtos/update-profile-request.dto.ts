import { updateProfileRequestSchema } from '@greyhoarder/protocol/auth';
import { createZodDto } from 'nestjs-zod';

export class UpdateProfileRequestDto extends createZodDto(updateProfileRequestSchema) {}
