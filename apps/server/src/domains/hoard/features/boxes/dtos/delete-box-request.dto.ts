import { deleteBoxRequestSchema } from '@greyhoarder/protocol/hoard';
import { createZodDto } from 'nestjs-zod';

export class DeleteBoxRequestDto extends createZodDto(deleteBoxRequestSchema) {}
