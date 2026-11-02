import { Inject, Injectable } from '@nestjs/common';
import { AppConfig } from '../../../config/app-config.js';
import { REDIS_CLIENT, type RedisClient } from '../../../platform/redis/redis.module.js';
import { SessionRegistry } from '../ports/session-registry.js';

/** One Redis set per user; it expires with the maximum session lifetime. */
@Injectable()
export class RedisSessionRegistry extends SessionRegistry {
  constructor(
    @Inject(REDIS_CLIENT) private readonly redis: RedisClient,
    private readonly config: AppConfig,
  ) {
    super();
  }

  async add(userId: string, sessionId: string): Promise<void> {
    await this.redis.sAdd(keyFor(userId), sessionId);
    await this.redis.pExpire(keyFor(userId), this.config.sessionMaxLifetimeMs);
  }

  async remove(userId: string, sessionId: string): Promise<void> {
    await this.redis.sRem(keyFor(userId), sessionId);
  }

  async has(userId: string, sessionId: string): Promise<boolean> {
    return (await this.redis.sIsMember(keyFor(userId), sessionId)) === 1;
  }

  async removeAll(userId: string): Promise<void> {
    await this.redis.del(keyFor(userId));
  }

  async keepOnly(userId: string, sessionId: string): Promise<void> {
    const others = (await this.redis.sMembers(keyFor(userId))).filter((id) => id !== sessionId);

    if (others.length > 0) {
      await this.redis.sRem(keyFor(userId), others);
    }
  }
}

function keyFor(userId: string): string {
  return `auth:user-sessions:${userId}`;
}
