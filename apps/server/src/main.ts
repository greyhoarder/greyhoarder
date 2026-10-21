import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { AppConfig } from './config/app-config.js';
import { SESSION_COOKIE, SESSION_COOKIE_OPTIONS } from './domains/auth/api/index.js';
import { REDIS_CLIENT, type RedisClient } from './platform/redis/redis.module.js';
import { createSessionMiddleware } from './platform/session/session.middleware.js';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const config = app.get(AppConfig);

  app.setGlobalPrefix('api');
  app.use(
    createSessionMiddleware({
      redis: app.get<RedisClient>(REDIS_CLIENT),
      secrets: config.sessionSecrets,
      idleSeconds: config.sessionIdleSeconds,
      cookieName: SESSION_COOKIE,
      cookie: SESSION_COOKIE_OPTIONS,
    }),
  );
  app.enableShutdownHooks();

  await app.listen(config.port);
}
await bootstrap();
