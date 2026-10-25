import { Body, Controller, Get, NotFoundException, Patch, UnprocessableEntityException } from '@nestjs/common';
import { InvalidMiniError } from '@greyhoarder/domain/hoard';
import type { User } from '@greyhoarder/domain/users';
import {
  type MinisResponse,
  minisResponseSchema,
  type UpdateMinisResponse,
  updateMinisResponseSchema,
} from '@greyhoarder/protocol/hoard';
import { ZodSerializerDto } from 'nestjs-zod';
import { CurrentUser } from '../../../../shared/auth/current-user.decorator.js';
import { UpdateMinisRequestDto } from './dtos/update-minis-request.dto.js';
import { UnknownMinisError } from './errors/unknown-minis.error.js';
import { UnknownPartError } from '../../models/errors/unknown-part.error.js';
import { UnknownFactionError } from './errors/unknown-faction.error.js';
import { MinisService } from './minis.service.js';

/** The minis of the signed-in user's hoard: list them (GET), change several alike at once (PATCH). */
@Controller('hoard/minis')
export class MinisController {
  constructor(private readonly minis: MinisService) {}

  @Get()
  @ZodSerializerDto(minisResponseSchema)
  async list(@CurrentUser() user: User): Promise<MinisResponse> {
    const { minis, factionNames, systemNames } = await this.minis.list(user.id);
    return {
      minis,
      factionNames: Object.fromEntries(factionNames),
      systemNames: Object.fromEntries(systemNames),
    };
  }

  @Patch()
  @ZodSerializerDto(updateMinisResponseSchema)
  async update(@CurrentUser() user: User, @Body() body: UpdateMinisRequestDto): Promise<UpdateMinisResponse> {
    try {
      return { minis: await this.minis.update(user.id, body.ids, body.set) };
    } catch (error) {
      if (
        error instanceof UnknownMinisError ||
        error instanceof UnknownPartError ||
        error instanceof UnknownFactionError
      ) {
        throw new NotFoundException(error.message);
      }
      if (error instanceof InvalidMiniError) {
        throw new UnprocessableEntityException(error.message);
      }
      throw error;
    }
  }
}
