import { Controller, Get, Query } from '@nestjs/common';
import {
  type KitSearchResponse,
  kitSearchResponseSchema,
  type KitsRequest,
  kitsRequestSchema,
} from '@greyhoarder/protocol/catalog';
import { ZodSerializerDto, ZodValidationPipe } from 'nestjs-zod';
import { KitsService } from './kits.service.js';

/** The catalog kits, read-only for every signed-in user. */
@Controller('catalog/kits')
export class KitsController {
  constructor(private readonly kits: KitsService) {}

  /** A search, or one version of a kit; a union has no DTO class, so the pipe validates it here. */
  @Get()
  @ZodSerializerDto(kitSearchResponseSchema)
  async list(@Query(new ZodValidationPipe(kitsRequestSchema)) query: KitsRequest): Promise<KitSearchResponse> {
    const result =
      'search' in query ? await this.kits.search(query.search) : await this.kits.find(query.id, query.version);
    return {
      kits: result.kits.map(({ entry, version }) => ({ ...entry, version })),
      containedKits: result.containedKits.map(({ entry, version }) => ({ ...entry, version })),
      factionNames: Object.fromEntries(result.factionNames),
    };
  }
}
