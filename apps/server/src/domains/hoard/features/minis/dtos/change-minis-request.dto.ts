import { changeMinisRequestSchema } from '@greyhoarder/protocol/hoard';
import { createZodDto } from 'nestjs-zod';

export class ChangeMinisRequestDto extends createZodDto(changeMinisRequestSchema) {}
