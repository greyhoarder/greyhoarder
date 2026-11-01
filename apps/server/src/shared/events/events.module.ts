import { Global, Module } from '@nestjs/common';
import { DomainEvents } from './domain-events.js';

/** Publishing events from any domain. */
@Global()
@Module({ providers: [DomainEvents], exports: [DomainEvents] })
export class EventsModule {}
