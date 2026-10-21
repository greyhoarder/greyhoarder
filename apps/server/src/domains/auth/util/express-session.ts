import type { Request } from 'express';
import type { CookieOptions } from 'express-session';

declare module 'express-session' {
  interface SessionData {
    /** The only value stored in a session (ADR-0009). */
    userId: string;
  }
}

export const SESSION_COOKIE = 'greyhoarder.sid';

/**
 * Host-only, `Secure` by request scheme so plain HTTP at home keeps working
 * (ADR-0008, ADR-0009). Without `maxAge` the cookie lives until the browser closes.
 */
export const SESSION_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  path: '/',
  secure: 'auto',
};

export function regenerateSession(request: Request): Promise<void> {
  return new Promise((resolve, reject) =>
    request.session.regenerate((error: unknown) => (error ? reject(error) : resolve())),
  );
}

export function destroySession(request: Request): Promise<void> {
  return new Promise((resolve, reject) =>
    request.session.destroy((error: unknown) => (error ? reject(error) : resolve())),
  );
}
