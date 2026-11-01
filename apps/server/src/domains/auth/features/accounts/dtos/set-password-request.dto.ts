import { setPasswordRequestSchema } from '@greyhoarder/protocol/auth';
import { createZodDto } from 'nestjs-zod';

export class SetPasswordRequestDto extends createZodDto(setPasswordRequestSchema) {}
