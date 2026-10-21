import { Injectable } from '@nestjs/common';
import { toUsernameKey, type User } from '@greyhoarder/domain/users';
import { AccountsService } from '../../../users/api/index.js';
import { LoginAttempts } from '../../ports/login-attempts.js';
import { PasswordHasher } from '../../ports/password-hasher.js';
import { SessionRegistry } from '../../ports/session-registry.js';
import { InvalidCredentialsError } from './errors/invalid-credentials.error.js';
import { TooManyLoginAttemptsError } from './errors/too-many-login-attempts.error.js';

const FAILURES_BEFORE_LOCK = 5;
const MAX_LOCK_MS = 15 * 60 * 1000;

/** From the fifth failure on: one second, doubling with each failure, at most 15 minutes. */
function lockDurationMs(failures: number): number {
  if (failures < FAILURES_BEFORE_LOCK) {
    return 0;
  }
  return Math.min(1000 * 2 ** (failures - FAILURES_BEFORE_LOCK), MAX_LOCK_MS);
}

@Injectable()
export class SessionService {
  constructor(
    private readonly accounts: AccountsService,
    private readonly passwords: PasswordHasher,
    private readonly attempts: LoginAttempts,
    private readonly sessions: SessionRegistry,
  ) {}

  /**
   * Checks the credentials, rate-limited per client IP and per username.
   *
   * @throws TooManyLoginAttemptsError while the IP or the username is locked
   * @throws InvalidCredentialsError
   */
  async verify(username: string, password: string, clientIp: string): Promise<User> {
    const usernameSubject = `user:${toUsernameKey(username)}`;
    const subjects = [`ip:${clientIp}`, usernameSubject];

    await this.assertNotLocked(subjects);
    const user = await this.checkPassword(username, password);
    if (!user) {
      await this.recordFailure(subjects);
      throw new InvalidCredentialsError();
    }

    await this.attempts.reset(usernameSubject);
    return user;
  }

  startSession(userId: string, sessionId: string): Promise<void> {
    return this.sessions.add(userId, sessionId);
  }

  endSession(userId: string, sessionId: string): Promise<void> {
    return this.sessions.remove(userId, sessionId);
  }

  private async assertNotLocked(subjects: readonly string[]): Promise<void> {
    const lockedFor = await Promise.all(subjects.map((subject) => this.attempts.lockedForMs(subject)));
    const longestLockMs = Math.max(...lockedFor);
    if (longestLockMs > 0) {
      throw new TooManyLoginAttemptsError(longestLockMs);
    }
  }

  /** The user if the password matches and the account is active. Same timing in every case. */
  private async checkPassword(username: string, password: string): Promise<User | undefined> {
    const record = await this.accounts.findCredentials(username);
    if (!record) {
      await this.passwords.spendVerificationTime(password);
      return undefined;
    }
    const matches = await this.passwords.verify(record.passwordHash, password);
    return matches && !record.user.disabled ? record.user : undefined;
  }

  private async recordFailure(subjects: readonly string[]): Promise<void> {
    await Promise.all(
      subjects.map(async (subject) => {
        const lockMs = lockDurationMs(await this.attempts.recordFailure(subject));
        if (lockMs > 0) {
          await this.attempts.lock(subject, lockMs);
        }
      }),
    );
  }
}
