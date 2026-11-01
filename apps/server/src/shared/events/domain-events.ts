import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

/** Events between domains (ADR-0016); an event class's name is what listeners subscribe to. */
@Injectable()
export class DomainEvents {
  constructor(private readonly emitter: EventEmitter2) {}

  /** The listeners are part of the use case: this waits for them all, and an error of one aborts it. */
  async dispatch(event: object): Promise<void> {
    const results = await Promise.allSettled(
      this.emitter.listeners(event.constructor.name).map((listener) => listener(event)),
    );
    const failed = results.find((result) => result.status === 'rejected');
    if (failed !== undefined) {
      throw failed.reason;
    }
  }
}
