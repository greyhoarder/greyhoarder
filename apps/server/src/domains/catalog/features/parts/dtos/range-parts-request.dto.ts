import { rangePartsRequestSchema } from '@greyhoarder/protocol/catalog';
import { createZodDto } from 'nestjs-zod';

export class RangePartsRequestDto extends createZodDto(rangePartsRequestSchema) {}
