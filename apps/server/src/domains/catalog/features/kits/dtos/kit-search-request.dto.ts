import { kitSearchRequestSchema } from '@greyhoarder/protocol/catalog';
import { createZodDto } from 'nestjs-zod';

export class KitSearchRequestDto extends createZodDto(kitSearchRequestSchema) {}
