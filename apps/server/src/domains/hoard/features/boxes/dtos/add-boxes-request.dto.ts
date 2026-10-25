import { addBoxesRequestSchema } from '@greyhoarder/protocol/hoard';
import { createZodDto } from 'nestjs-zod';

export class AddBoxesRequestDto extends createZodDto(addBoxesRequestSchema) {}
