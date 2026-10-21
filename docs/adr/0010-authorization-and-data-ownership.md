# ADR-0010: Authorization and data ownership

- **Status:** Accepted
- **Date:** 2026-10-21

## Context

Several people share one instance, each with their own collection
(see ADR-0007). Users have the roles `admin` and `member`. A request's
user is known from its session (see ADR-0009).

## Decision

### Endpoints

- A global guard requires a valid session for every endpoint. Endpoints
  that must work without one (login, initial setup, health) are explicitly
  marked `@Public()`.
- Admin-only endpoints are marked `@Roles('admin')`.
- Controllers get the current user through `@CurrentUser()` only. The user
  is never taken from request bodies, parameters or client-set headers.
- Roles and account status are read on each request, so changes take
  effect immediately.
- The guards and decorators live in `auth` and are published through
  `auth/api`.

### Data ownership

- Data that belongs to a user carries an `ownerId`.
- Every query for such data is scoped to the current user on the server.
- Users see only their own data. Sharing between users is not supported
  for now.
- Ownership checks are business rules and live in the domain that owns the
  data, not in `auth`.

There is no separate authorization domain.

### Alternatives considered

- **Opt-in guards per controller**: explicit, but a forgotten guard leaves
  an endpoint open. A global guard with explicit exceptions fails safe.
- **A separate `authz` domain or a policy library** (e.g. CASL): worthwhile
  with complex permissions, such as sharing collections between users.
  Not needed for two roles and per-user ownership.
- **Ownership checks in a central place**: one place for all rules, but it
  would have to know every domain and reverse the dependencies of
  ADR-0004.

## Consequences

- New endpoints are protected by default.
- Every domain with user-owned data must scope its queries; this needs
  tests per domain.
- Sharing collections between household members will require a new
  decision and likely a richer permission model.

## Derived rules

- Every endpoint requires a session unless marked `@Public()`.
- Mark admin-only endpoints with `@Roles('admin')`.
- Get the current user only through `@CurrentUser()`.
- Read roles and account status per request, never from the session.
- User-owned data carries `ownerId`; scope every query by it on the
  server.
- Ownership checks live in the owning domain.
