import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UnprocessableEntityException,
} from '@nestjs/common';
import { EmptyBoxError, InvalidRowsError } from '@greyhoarder/domain/hoard';
import type { User } from '@greyhoarder/domain/users';
import {
  type AddBoxesResponse,
  addBoxesResponseSchema,
  type BoxesResponse,
  boxesResponseSchema,
  type DeleteBoxResponse,
  deleteBoxResponseSchema,
  type EditBoxRowsResponse,
  editBoxRowsResponseSchema,
} from '@greyhoarder/protocol/hoard';
import { ZodSerializerDto } from 'nestjs-zod';
import { CurrentUser } from '../../../../shared/auth/current-user.decorator.js';
import { BoxesService } from './boxes.service.js';
import { AddBoxesRequestDto } from './dtos/add-boxes-request.dto.js';
import { DeleteBoxRequestDto } from './dtos/delete-box-request.dto.js';
import { EditBoxRowsRequestDto } from './dtos/edit-box-rows-request.dto.js';
import { BoxWithoutKitError } from './errors/box-without-kit.error.js';
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

  @Put(':id/rows')
  @ZodSerializerDto(editBoxRowsResponseSchema)
  async editRows(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() body: EditBoxRowsRequestDto,
  ): Promise<EditBoxRowsResponse> {
    try {
      return await this.boxes.editRows(user.id, id, body.rows);
    } catch (error) {
      if (error instanceof UnknownBoxError || error instanceof UnknownKitError) {
        throw new NotFoundException(error.message);
      }
      if (error instanceof BoxWithoutKitError || error instanceof InvalidRowsError) {
        throw new UnprocessableEntityException(error.message);
      }
      throw error;
    }
  }

  @Delete(':id')
  @ZodSerializerDto(deleteBoxResponseSchema)
  async delete(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Query() query: DeleteBoxRequestDto,
  ): Promise<DeleteBoxResponse> {
    try {
      return await this.boxes.delete(user.id, id, { keepBuiltMinis: query.keepBuiltMinis });
    } catch (error) {
      if (error instanceof UnknownBoxError) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }
}
