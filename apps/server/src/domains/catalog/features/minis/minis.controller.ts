import { Controller, Get, Query } from '@nestjs/common';
import { type CatalogMiniSearchResponse, catalogMiniSearchResponseSchema } from '@greyhoarder/protocol/catalog';
import { ZodSerializerDto } from 'nestjs-zod';
import { CatalogMiniSearchRequestDto } from './dtos/catalog-mini-search-request.dto.js';
import { MinisService } from './minis.service.js';

/** The minis the catalog kits can be built as, read-only for every signed-in user. */
@Controller('catalog/minis')
export class MinisController {
  constructor(private readonly minis: MinisService) {}

  @Get()
  @ZodSerializerDto(catalogMiniSearchResponseSchema)
  async search(@Query() query: CatalogMiniSearchRequestDto): Promise<CatalogMiniSearchResponse> {
    const { minis, factionNames, systemNames } = await this.minis.search(query.search);
    return {
      minis,
      factionNames: Object.fromEntries(factionNames),
      systemNames: Object.fromEntries(systemNames),
    };
  }
}
