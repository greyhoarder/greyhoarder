import { factionSearchRequestSchema } from '@greyhoarder/protocol/catalog';
import { createZodDto } from 'nestjs-zod';

export class FactionSearchRequestDto extends createZodDto(factionSearchRequestSchema) {}
