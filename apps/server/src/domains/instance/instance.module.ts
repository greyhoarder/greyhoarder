import { Module } from '@nestjs/common';
import { HealthController } from './features/health/health.controller.js';

/** State of the instance as a whole: health, later instance settings. Depends on no other domain. */
@Module({ controllers: [HealthController] })
export class InstanceModule {}
