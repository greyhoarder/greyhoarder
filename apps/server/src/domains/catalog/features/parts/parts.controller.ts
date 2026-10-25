import { Controller, Get, Query } from '@nestjs/common';
import { type RangePartsResponse, rangePartsResponseSchema } from '@greyhoarder/protocol/catalog';
import { ZodSerializerDto } from 'nestjs-zod';
import { RangePartsRequestDto } from './dtos/range-parts-request.dto.js';
import { PartsService } from './parts.service.js';

/** The parts the catalog kits of factions offer, read-only for every signed-in user. */
@Controller('catalog/parts')
export class PartsController {
  constructor(private readonly parts: PartsService) {}

  @Get()
  @ZodSerializerDto(rangePartsResponseSchema)
  async list(@Query() query: RangePartsRequestDto): Promise<RangePartsResponse> {
    return { parts: await this.parts.rangeParts(query.factionIds) };
  }
}
