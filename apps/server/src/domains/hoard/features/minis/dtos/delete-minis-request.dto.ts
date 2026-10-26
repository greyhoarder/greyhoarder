import { deleteMinisRequestSchema } from '@greyhoarder/protocol/hoard';
import { createZodDto } from 'nestjs-zod';

export class DeleteMinisRequestDto extends createZodDto(deleteMinisRequestSchema) {}
