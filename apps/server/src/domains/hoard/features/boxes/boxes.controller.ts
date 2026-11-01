import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  UnprocessableEntityException,
} from '@nestjs/common';
import { EmptyBoxError, InvalidRowsError } from '@greyhoarder/domain/hoard';
import type { User } from '@greyhoarder/domain/users';
import {
  type AddBoxesResponse,
  addBoxesResponseSchema,
  type BoxesResponse,
  boxesResponseSchema,
  type DeleteBoxesResponse,
  deleteBoxesResponseSchema,
} from '@greyhoarder/protocol/hoard';
import { ZodSerializerDto } from 'nestjs-zod';
import { CurrentUser } from '../../../../shared/auth/current-user.decorator.js';
import { BoxesService } from './boxes.service.js';
import { AddBoxesRequestDto } from './dtos/add-boxes-request.dto.js';
import { DeleteBoxesRequestDto } from './dtos/delete-boxes-request.dto.js';
import { UnknownBoxError } from './errors/unknown-box.error.js';
import { UnknownKitError } from '../../models/errors/unknown-kit.error.js';

/**
 * The boxes of the signed-in user's hoard: list them (GET), add boxes of a catalog kit (POST),
 * count the minis on the sprue of one anew (PUT :id/rows), delete one with its minis or only those
 * on the sprue (DELETE).
 */
@Controller('hoard/boxes')
export class BoxesController {
  constructor(private readonly boxes: BoxesService) {}

  @Get()
  @ZodSerializerDto(boxesResponseSchema)
  async list(@CurrentUser() user: User): Promise<BoxesResponse> {
    const { boxes, factionNames } = await this.boxes.list(user.id);
    return { boxes, factionNames: Object.fromEntries(factionNames) };
  }

  @Post()
  @ZodSerializerDto(addBoxesResponseSchema)
  async add(@CurrentUser() user: User, @Body() body: AddBoxesRequestDto): Promise<AddBoxesResponse> {
    try {
      return await this.boxes.add(user.id, body);
    } catch (error) {
      if (error instanceof UnknownKitError) {
        throw new NotFoundException(error.message);
      }
      if (error instanceof EmptyBoxError || error instanceof InvalidRowsError) {
        throw new UnprocessableEntityException(error.message);
      }
      throw error;
    }
  }

  @Delete()
  @ZodSerializerDto(deleteBoxesResponseSchema)
  async delete(@CurrentUser() user: User, @Body() body: DeleteBoxesRequestDto): Promise<DeleteBoxesResponse> {
    try {
      return await this.boxes.delete(user.id, body.ids, { keepBuiltMinis: body.keepBuiltMinis });
    } catch (error) {
      if (error instanceof UnknownBoxError) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }
}
