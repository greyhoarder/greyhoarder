import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { UserDeleting } from '../../../../../shared/events/user-deleting.event.js';
import { HoardRepository } from '../../../ports/hoard-repository.js';

/** A deleted account takes its hoard with it (ADR-0007). */
@Injectable()
export class UserDeletingListener {
  constructor(private readonly hoard: HoardRepository) {}

  @OnEvent(UserDeleting.name, { suppressErrors: false })
  handle({ userId }: UserDeleting): Promise<void> {
    return this.hoard.deleteHoard(userId);
  }
}
