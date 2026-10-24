import { Controller, Get, Query } from '@nestjs/common';
import { type KitSearchResponse, kitSearchResponseSchema } from '@greyhoarder/protocol/catalog';
import { ZodSerializerDto } from 'nestjs-zod';
import { KitSearchRequestDto } from './dtos/kit-search-request.dto.js';
import { KitsService } from './kits.service.js';

/** The catalog kits, read-only for every signed-in user. */
@Controller('catalog/kits')
export class KitsController {
  constructor(private readonly kits: KitsService) {}

  @Get()
  @ZodSerializerDto(kitSearchResponseSchema)
  async search(@Query() query: KitSearchRequestDto): Promise<KitSearchResponse> {
    const result = await this.kits.search(query.search);
    return {
      kits: result.kits,
      containedKits: result.containedKits,
      factionNames: Object.fromEntries(result.factionNames),
    };
  }
}
