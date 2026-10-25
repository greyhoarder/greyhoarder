import { Controller, Get } from '@nestjs/common';
import type { User } from '@greyhoarder/domain/users';
import { type PartsResponse, partsResponseSchema } from '@greyhoarder/protocol/hoard';
import { ZodSerializerDto } from 'nestjs-zod';
import { CurrentUser } from '../../../../shared/auth/current-user.decorator.js';
import { PartsService } from './parts.service.js';

/** The signed-in user's vocabulary of parts. */
@Controller('hoard/parts')
export class PartsController {
  constructor(private readonly parts: PartsService) {}

  @Get()
  @ZodSerializerDto(partsResponseSchema)
  async list(@CurrentUser() user: User): Promise<PartsResponse> {
    return { parts: await this.parts.list(user.id) };
  }
}
