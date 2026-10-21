import { loginRequestSchema } from '@greyhoarder/protocol/auth';
import { createZodDto } from 'nestjs-zod';

export class LoginRequestDto extends createZodDto(loginRequestSchema) {}
