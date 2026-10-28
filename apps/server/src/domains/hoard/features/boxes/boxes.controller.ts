import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  UnprocessableEntityException,
} from '@nestjs/common';
import { EmptyBoxError } from '@greyhoarder/domain/hoard';
import type { User } from '@greyhoarder/domain/users';
import {
  type AddBoxesResponse,
  addBoxesResponseSchema,
  type BoxesResponse,
  boxesResponseSchema,
  type DeleteBoxResponse,
  deleteBoxResponseSchema,
} from '@greyhoarder/protocol/hoard';
import { ZodSerializerDto } from 'nestjs-zod';
import { CurrentUser } from '../../../../shared/auth/current-user.decorator.js';
import { BoxesService } from './boxes.service.js';
import { AddBoxesRequestDto } from './dtos/add-boxes-request.dto.js';
import { UnknownBoxError } from './errors/unknown-box.error.js';
import { UnknownKitError } from '../../models/errors/unknown-kit.error.js';

/**
 * The boxes of the signed-in user's hoard: list them (GET), add boxes of a catalog kit (POST),
 * delete one with its minis (DELETE).
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
  async add(
    @CurrentUser() user: User,
    @Body() body: AddBoxesRequestDto,
  ): Promise<AddBoxesResponse> {
    try {
      return await this.boxes.add(user.id, body);
    } catch (error) {
      if (error instanceof UnknownKitError) {
        throw new NotFoundException(error.message);
      }
      if (error instanceof EmptyBoxError) {
        throw new UnprocessableEntityException(error.message);
      }
      throw error;
    }
  }

  @Delete(':id')
  @ZodSerializerDto(deleteBoxResponseSchema)
  async delete(@CurrentUser() user: User, @Param('id') id: string): Promise<DeleteBoxResponse> {
    try {
      return await this.boxes.delete(user.id, id);
    } catch (error) {
      if (error instanceof UnknownBoxError) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }
}
