import { updateMinisRequestSchema } from '@greyhoarder/protocol/hoard';
import { createZodDto } from 'nestjs-zod';

export class UpdateMinisRequestDto extends createZodDto(updateMinisRequestSchema) {}
