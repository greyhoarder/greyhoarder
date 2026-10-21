import { RedisStore } from 'connect-redis';
import type { RequestHandler } from 'express';
import session, { type CookieOptions } from 'express-session';
import type { RedisClient } from '../redis/redis.module.js';

export interface SessionMiddlewareOptions {
  readonly redis: RedisClient;
  readonly secrets: readonly string[];
  /** Inactivity ends a session through the store's TTL, which every request renews. */
  readonly idleSeconds: number;
  readonly cookieName: string;
  readonly cookie: CookieOptions;
}

/** How sessions are stored: express-session with a Redis store (ADR-0009). What goes in them is up to `auth`. */
export function createSessionMiddleware(options: SessionMiddlewareOptions): RequestHandler {
  return session({
    name: options.cookieName,
    secret: [...options.secrets],
    store: new RedisStore({ client: options.redis, prefix: 'session:', ttl: options.idleSeconds }),
    resave: false,
    saveUninitialized: false,
    cookie: options.cookie,
  });
}
