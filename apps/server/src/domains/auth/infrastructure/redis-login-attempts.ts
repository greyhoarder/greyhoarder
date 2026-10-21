import { Inject, Injectable } from '@nestjs/common';
import { REDIS_CLIENT, type RedisClient } from '../../../platform/redis/redis.module.js';
import { LoginAttempts } from '../ports/login-attempts.js';

const FAILURE_WINDOW_SECONDS = 15 * 60;

/** A failure counter with a 15-minute window and a lock key per subject. */
@Injectable()
export class RedisLoginAttempts extends LoginAttempts {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: RedisClient) {
    super();
  }

  async lockedForMs(subject: string): Promise<number> {
    return Math.max(0, await this.redis.pTTL(lockKey(subject)));
  }

  async recordFailure(subject: string): Promise<number> {
    const failures = await this.redis.incr(failureKey(subject));
    if (failures === 1) {
      await this.redis.expire(failureKey(subject), FAILURE_WINDOW_SECONDS);
    }
    return failures;
  }

  async lock(subject: string, durationMs: number): Promise<void> {
    await this.redis.set(lockKey(subject), '1');
    await this.redis.pExpire(lockKey(subject), durationMs);
  }

  async reset(subject: string): Promise<void> {
    await this.redis.del([failureKey(subject), lockKey(subject)]);
  }
}

function failureKey(subject: string): string {
  return `auth:login-failures:${subject}`;
}

function lockKey(subject: string): string {
  return `auth:login-lock:${subject}`;
}
