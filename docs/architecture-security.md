# Architecture: security

Rules for hosting, serving the web app, accounts, sessions and
authorization. Where `users` and `auth` sit among the domains is covered
in [architecture-boundaries.md](architecture-boundaries.md).

## Hosting

- Accept plain HTTP only from configured private networks.
- Trust forwarded headers only from configured proxy addresses.
- Never configure or hard-code hostnames in the app.
- Serve the web app and the API under the same origin; no CORS for
  browser clients.

_(derived from [ADR-0008](adr/0008-reverse-proxy-and-hostnames.md))_

## Serving the web app

- In production, the server serves the client build; a reverse proxy only
  terminates TLS and forwards requests.
- Never answer a path under `/api` with the web app; unknown API paths get
  the API's 404. Answer every other path without a matching file with
  `index.html`.
- Serve files with a content hash in their name as immutable with a long
  cache lifetime; serve `index.html` with `no-cache`.
- Apply session handling only to `/api`.
- Set up static serving at app level next to `app.module.ts`, never in a
  domain or in `platform/`.
- `GET /api/health` is public and reports only whether the server is
  ready.

_(derived from [ADR-0017](adr/0017-server-serves-the-web-app.md),
[ADR-0018](adr/0018-end-to-end-tests-with-an-instance-per-worker.md))_

## Accounts

- Never store, log or return plain passwords.
- Hash passwords with Argon2id.
- Only `auth` creates accounts: through the initial setup and through
  account creation by administrators. No other endpoint creates accounts.
- The initial setup is available only while no account exists.
- Only `auth` hashes and verifies passwords. `users` stores the hash and
  returns it only through the `users/api` method meant for signing in.

_(derived from [ADR-0007](adr/0007-local-user-accounts.md))_

## Sessions

- Use `express-session` with `connect-redis`; don't build a custom session
  mechanism.
- Never set `Domain` on the session cookie; set `Secure` by request scheme.
- Regenerate the session on login; store only the user ID in it.
- Keep the per-user set of session IDs in sync when creating or destroying
  sessions.
- Never log session IDs.
- Reject state-changing requests from another origin with NestJS's
  `app.enableCsrfProtection()` in `main.ts`, before the sessions; it checks
  `Sec-Fetch-Site`, or else whether `Origin` matches the request's host.
  Never change state in a `GET` request.
- Rate-limit login; give the same error for unknown user and wrong
  password.

_(derived from [ADR-0009](adr/0009-sessions-with-redis.md))_

## Authorization

- Every endpoint requires a session unless marked `@Public()`.
- Mark admin-only endpoints with `@Roles('admin')`.
- Get the current user only through `@CurrentUser()`, never from request
  bodies, parameters or client-set headers.
- Read roles and account status per request, never from the session.
- User-owned data carries `ownerId`; scope every query by it on the
  server.
- Ownership checks live in the domain that owns the data.
- `@Public()`, `@Roles()` and `@CurrentUser()` live in
  `apps/server/src/shared/auth/` and contain no logic; the global guard
  that evaluates them lives in `auth`. The role type comes from
  `@greyhoarder/domain/users`.

_(derived from [ADR-0010](adr/0010-authorization-and-data-ownership.md))_
