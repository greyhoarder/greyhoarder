import { addAccountRequestSchema } from '@greyhoarder/protocol/auth';
import { createZodDto } from 'nestjs-zod';

export class AddAccountRequestDto extends createZodDto(addAccountRequestSchema) {}
