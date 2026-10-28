import { addMinisRequestSchema } from '@greyhoarder/protocol/hoard';
import { createZodDto } from 'nestjs-zod';

export class AddMinisRequestDto extends createZodDto(addMinisRequestSchema) {}
