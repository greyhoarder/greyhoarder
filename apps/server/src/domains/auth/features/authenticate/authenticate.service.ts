import { Injectable } from '@nestjs/common';
import type { User } from '@greyhoarder/domain/users';
import { UserQueries } from '../../../users/api/index.js';
import { SessionRegistry } from '../../ports/session-registry.js';
import { SessionInvalidError } from './errors/session-invalid.error.js';

@Injectable()
export class AuthenticateService {
  constructor(
    private readonly sessions: SessionRegistry,
    private readonly users: UserQueries,
  ) {}

  /**
   * The user behind a session, read fresh on every request so that a
   * disabled account takes effect at once (ADR-0010).
   *
   * @throws SessionInvalidError
   */
  async authenticate(userId: string, sessionId: string): Promise<User> {
    if (!(await this.sessions.has(userId, sessionId))) {
      throw new SessionInvalidError();
    }
    const user = await this.users.findById(userId);
    if (!user || user.disabled) {
      throw new SessionInvalidError();
    }
    return user;
  }

  endSession(userId: string, sessionId: string): Promise<void> {
    return this.sessions.remove(userId, sessionId);
  }
}
