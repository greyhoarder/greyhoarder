# ADR-0009: Sessions with express-session and Redis

- **Status:** Accepted
- **Date:** 2026-10-21

## Context

Users sign in with local accounts (see ADR-0007). The same instance is
reachable under several hostnames, over HTTPS from the internet and over
plain HTTP on the home network (see ADR-0008).

Access must end immediately on logout, on a password change and when an
administrator disables an account. Users should be able to see and end
their sessions on other devices.

NestJS documents session handling through `express-session`, which needs a
separate session store for production use.

## Decision

### Session handling

- Sessions are handled with `express-session` and stored in **Redis**
  through `connect-redis`. Redis runs as its own container in the stack,
  persists its data and is reachable only inside the stack's network.
- The session cookie is host-only (no `Domain` attribute), `HttpOnly`,
  `SameSite=Lax` and `Path=/`. `Secure` is set automatically when the
  request arrived over HTTPS. Each hostname has its own sessions.
- The session ID is regenerated on login, so a session that existed before
  login is never reused.
- The session stores only the user ID.
- The server keeps a set of session IDs per user in Redis, so a user's
  sessions can be listed and ended together.
- Sessions expire after a period of inactivity and after a maximum
  lifetime; both are configurable. Logout destroys the session.
- A password change or a disabled account ends that user's other
  sessions.
- The session secret comes from configuration. Several secrets can be set
  at once, so the secret can be rotated without signing everyone out.

### Protection

- State-changing requests must carry an `Origin` header equal to the
  request's own origin (scheme and host as seen by the client). This works
  for any number of hostnames without configuration.
- Login attempts are rate-limited per client IP and per account, with
  increasing delays after failures.
- Login errors do not reveal whether a username exists.

### Placement

Login, logout and sessions form a new domain, `auth`, in both apps
(extending the domains of ADR-0004). `auth` depends only on `users`.

### Alternatives considered

- **JWT access and refresh tokens**: tokens can be checked without a
  database lookup, but that saves nothing with one server. Ending access at
  once still requires server-side refresh tokens, plus rotation and key
  management.
- **Sessions in MongoDB (`connect-mongo`)**: one container less. Rejected to
  keep short-lived session data apart from domain data, to use Redis'
  native expiry, and to keep the option of running several server
  instances.
- **Self-built session tokens**: full control, but reimplements what
  `express-session` already provides.
- **`__Host-` cookie prefix**: stronger cookie binding, but requires
  `Secure` and would break plain HTTP on the home network (ADR-0008).

## Consequences

- Sessions can be ended at once, per device or for all devices.
- Redis is one more container to run, configure for persistence and back
  up.
- Sessions on plain-HTTP hostnames can be read by anyone on the home
  network (see ADR-0008).
- Sessions are cookie-based only. Packaged clients rely on the cookie
  support of their packaging (e.g. native cookie handling in Capacitor,
  the cookie store in Electron). If that proves insufficient, a
  token-based path is decided together with the packaging.

## Derived rules

- Use `express-session` with `connect-redis`; don't build a custom session
  mechanism.
- Never set `Domain` on the session cookie; set `Secure` by request scheme.
- Regenerate the session on login; store only the user ID in it.
- Keep the per-user set of session IDs in sync when creating or destroying
  sessions.
- Never log session IDs.
- State-changing requests require an `Origin` equal to the request's own
  origin.
- Rate-limit login; give the same error for unknown user and wrong
  password.
- `auth` depends only on `users`.
