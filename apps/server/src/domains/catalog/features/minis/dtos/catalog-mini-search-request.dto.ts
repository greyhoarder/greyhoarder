import { catalogMiniSearchRequestSchema } from '@greyhoarder/protocol/catalog';
import { createZodDto } from 'nestjs-zod';

export class CatalogMiniSearchRequestDto extends createZodDto(catalogMiniSearchRequestSchema) {}
