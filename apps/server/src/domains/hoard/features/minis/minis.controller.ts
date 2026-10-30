import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Patch,
  Post,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InvalidMiniError } from '@greyhoarder/domain/hoard';
import type { User } from '@greyhoarder/domain/users';
import {
  type AddMinisResponse,
  addMinisResponseSchema,
  type DeleteMinisResponse,
  deleteMinisResponseSchema,
  type MinisResponse,
  minisResponseSchema,
  type UpdateMinisResponse,
  updateMinisResponseSchema,
} from '@greyhoarder/protocol/hoard';
import { ZodSerializerDto } from 'nestjs-zod';
import { CurrentUser } from '../../../../shared/auth/current-user.decorator.js';
import { AddMinisRequestDto } from './dtos/add-minis-request.dto.js';
import { DeleteMinisRequestDto } from './dtos/delete-minis-request.dto.js';
import { UpdateMinisRequestDto } from './dtos/update-minis-request.dto.js';
import { UnknownMinisError } from './errors/unknown-minis.error.js';
import { UnknownKitError } from '../../models/errors/unknown-kit.error.js';
import { UnknownPartError } from '../../models/errors/unknown-part.error.js';
import { UnknownFactionError } from './errors/unknown-faction.error.js';
import { MinisService } from './minis.service.js';

/**
 * The minis of the signed-in user's hoard: list them (GET), add alike ones without a box (POST),
 * change several alike at once (PATCH), delete them for good (DELETE).
 */
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

  @Post()
  @ZodSerializerDto(addMinisResponseSchema)
  async add(@CurrentUser() user: User, @Body() body: AddMinisRequestDto): Promise<AddMinisResponse> {
    try {
      return { minis: await this.minis.add(user.id, body) };
    } catch (error) {
      if (
        error instanceof UnknownPartError ||
        error instanceof UnknownFactionError ||
        error instanceof UnknownKitError
      ) {
        throw new NotFoundException(error.message);
      }
      if (error instanceof InvalidMiniError) {
        throw new UnprocessableEntityException(error.message);
      }
      throw error;
    }
  }

  @Patch()
  @ZodSerializerDto(updateMinisResponseSchema)
  async update(
    @CurrentUser() user: User,
    @Body() body: UpdateMinisRequestDto,
  ): Promise<UpdateMinisResponse> {
    try {
      const { minis, ownFactionNames } = await this.minis.update(user.id, body.ids, body.set);
      return { minis, ownFactionNames: Object.fromEntries(ownFactionNames) };
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

  @Delete()
  @ZodSerializerDto(deleteMinisResponseSchema)
  async delete(
    @CurrentUser() user: User,
    @Body() body: DeleteMinisRequestDto,
  ): Promise<DeleteMinisResponse> {
    try {
      return await this.minis.delete(user.id, body.ids);
    } catch (error) {
      if (error instanceof UnknownMinisError) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }
}
