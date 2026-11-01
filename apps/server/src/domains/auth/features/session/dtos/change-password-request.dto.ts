import { changePasswordRequestSchema } from '@greyhoarder/protocol/auth';
import { createZodDto } from 'nestjs-zod';

export class ChangePasswordRequestDto extends createZodDto(changePasswordRequestSchema) {}
