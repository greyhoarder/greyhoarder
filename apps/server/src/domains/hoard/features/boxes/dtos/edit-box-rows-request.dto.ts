import { editBoxRowsRequestSchema } from '@greyhoarder/protocol/hoard';
import { createZodDto } from 'nestjs-zod';

export class EditBoxRowsRequestDto extends createZodDto(editBoxRowsRequestSchema) {}
