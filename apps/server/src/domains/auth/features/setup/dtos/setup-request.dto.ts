import { setupRequestSchema } from '@greyhoarder/protocol/auth';
import { createZodDto } from 'nestjs-zod';

export class SetupRequestDto extends createZodDto(setupRequestSchema) {}
