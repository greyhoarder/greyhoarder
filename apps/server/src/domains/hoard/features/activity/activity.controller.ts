import { Controller, Get } from '@nestjs/common';
import { isoDay } from '@greyhoarder/domain/hoard';
import type { User } from '@greyhoarder/domain/users';
import { type ActivityResponse, activityResponseSchema } from '@greyhoarder/protocol/hoard';
import { ZodSerializerDto } from 'nestjs-zod';
import { CurrentUser } from '../../../../shared/auth/current-user.decorator.js';
import { ActivityService } from './activity.service.js';

/** What got done in the signed-in user's hoard. */
@Controller('hoard/activity')
export class ActivityController {
  constructor(private readonly activity: ActivityService) {}

  @Get()
  @ZodSerializerDto(activityResponseSchema)
  overview(@CurrentUser() user: User): Promise<ActivityResponse> {
    return this.activity.overview(user.id, isoDay(new Date()));
  }
}
