# Architecture: security

Rules for hosting, accounts, sessions and authorization. Where `users` and
`auth` sit among the domains is covered in
[architecture-boundaries.md](architecture-boundaries.md).

## Hosting

- Accept plain HTTP only from configured private networks.
- Trust forwarded headers only from configured proxy addresses.
- Never configure or hard-code hostnames in the app.
- Serve the web app and the API under the same origin; no CORS for
  browser clients.

_(derived from [ADR-0008](adr/0008-reverse-proxy-and-hostnames.md))_

## Accounts

- Never store, log or return plain passwords.
- Hash passwords with Argon2id.
- No endpoint creates accounts except the initial setup and admin user
  management.
- The initial setup is available only while no account exists.

_(derived from [ADR-0007](adr/0007-local-user-accounts.md))_

## Sessions

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

_(derived from [ADR-0010](adr/0010-authorization-and-data-ownership.md))_
