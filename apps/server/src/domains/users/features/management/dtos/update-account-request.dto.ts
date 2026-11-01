import { updateAccountRequestSchema } from '@greyhoarder/protocol/auth';
import { createZodDto } from 'nestjs-zod';

export class UpdateAccountRequestDto extends createZodDto(updateAccountRequestSchema) {}
