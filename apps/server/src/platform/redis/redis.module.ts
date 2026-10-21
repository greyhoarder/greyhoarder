import { Global, Inject, Module, type OnApplicationShutdown } from '@nestjs/common';
import { createClient } from 'redis';
import { AppConfig } from '../../config/app-config.js';

function createRedisClient(url: string) {
  return createClient({ url });
}

export type RedisClient = ReturnType<typeof createRedisClient>;

export const REDIS_CLIENT = Symbol('REDIS_CLIENT');

/** One Redis connection for the whole app: sessions and auth counters. */
@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [AppConfig],
      useFactory: async (config: AppConfig): Promise<RedisClient> => {
        const client = createRedisClient(config.redisUrl);
        await client.connect();
        return client;
      },
    },
  ],
  exports: [REDIS_CLIENT],
})
export class RedisModule implements OnApplicationShutdown {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: RedisClient) {}

  async onApplicationShutdown(): Promise<void> {
    await this.redis.close();
  }
}
