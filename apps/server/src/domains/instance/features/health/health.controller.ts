import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { Public } from '../../../../shared/auth/public.decorator.js';

/** Answers once the server has started, including its MongoDB and Redis connections (ADR-0018). */
@Controller('health')
export class HealthController {
  @Public()
  @Get()
  @HttpCode(HttpStatus.NO_CONTENT)
  ready(): void {}
}
