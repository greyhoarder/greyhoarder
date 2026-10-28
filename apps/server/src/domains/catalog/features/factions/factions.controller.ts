import { Controller, Get, Query } from '@nestjs/common';
import { type FactionSearchResponse, factionSearchResponseSchema } from '@greyhoarder/protocol/catalog';
import { ZodSerializerDto } from 'nestjs-zod';
import { FactionSearchRequestDto } from './dtos/faction-search-request.dto.js';
import { FactionsService } from './factions.service.js';

/** The catalog factions, read-only for every signed-in user. */
@Controller('catalog/factions')
export class FactionsController {
  constructor(private readonly factions: FactionsService) {}

  @Get()
  @ZodSerializerDto(factionSearchResponseSchema)
  async search(@Query() query: FactionSearchRequestDto): Promise<FactionSearchResponse> {
    return { factions: await this.factions.search(query.search) };
  }
}
