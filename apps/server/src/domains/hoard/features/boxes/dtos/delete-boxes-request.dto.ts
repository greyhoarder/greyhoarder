import { deleteBoxesRequestSchema } from '@greyhoarder/protocol/hoard';
import { createZodDto } from 'nestjs-zod';

export class DeleteBoxesRequestDto extends createZodDto(deleteBoxesRequestSchema) {}
