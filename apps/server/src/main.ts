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
  // Before the sessions, so a request from another origin never touches Redis (ADR-0009).
  app.enableCsrfProtection();
  // Files of the web app never touch Redis (ADR-0017).
  app.use(
    '/api',
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
