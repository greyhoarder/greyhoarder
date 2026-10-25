import { Controller, Get } from '@nestjs/common';
import type { User } from '@greyhoarder/domain/users';
import { type MinisResponse, minisResponseSchema } from '@greyhoarder/protocol/hoard';
import { ZodSerializerDto } from 'nestjs-zod';
import { CurrentUser } from '../../../../shared/auth/current-user.decorator.js';
import { MinisService } from './minis.service.js';

/** The minis of the signed-in user's hoard. */
@Controller('hoard/minis')
export class MinisController {
  constructor(private readonly minis: MinisService) {}

  @Get()
  @ZodSerializerDto(minisResponseSchema)
  async list(@CurrentUser() user: User): Promise<MinisResponse> {
    const { minis, factionNames } = await this.minis.list(user.id);
    return { minis, factionNames: Object.fromEntries(factionNames) };
  }
}
