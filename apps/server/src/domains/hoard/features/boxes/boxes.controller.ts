import { Body, Controller, Get, NotFoundException, Post, UnprocessableEntityException } from '@nestjs/common';
import { EmptyBoxError } from '@greyhoarder/domain/hoard';
import type { User } from '@greyhoarder/domain/users';
import {
  type AddBoxesResponse,
  addBoxesResponseSchema,
  type BoxesResponse,
  boxesResponseSchema,
} from '@greyhoarder/protocol/hoard';
import { ZodSerializerDto } from 'nestjs-zod';
import { CurrentUser } from '../../../../shared/auth/current-user.decorator.js';
import { BoxesService } from './boxes.service.js';
import { AddBoxesRequestDto } from './dtos/add-boxes-request.dto.js';
import { UnknownKitError } from './errors/unknown-kit.error.js';

/** The boxes of the signed-in user's hoard: list them (GET), add boxes of a catalog kit (POST). */
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
      if (error instanceof EmptyBoxError) {
        throw new UnprocessableEntityException(error.message);
      }
      throw error;
    }
  }
}
