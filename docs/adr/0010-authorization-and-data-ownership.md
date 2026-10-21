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
- The decorators `@Public()`, `@Roles()` and `@CurrentUser()` only attach
  or read request metadata and contain no logic. They live in
  `apps/server/src/shared/auth/`, so every domain can use them, including
  `users`, which `auth` depends on (see ADR-0007, ADR-0009). This is the
  agreement for `shared/` required by ADR-0004.
- The global guard that evaluates them lives in `auth`.

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
- **Decorators in `auth/api`**: everything about authorization in one
  domain, but `users` needs the decorators for its own endpoints and `auth`
  depends on `users`, which creates a cycle.
- **Decorators in `users/api`**: no cycle, and `users` owns the roles, but
  every domain with endpoints would depend on `users`, and `@Public()` is
  not a `users` concept.
- **Ownership checks in a central place**: one place for all rules, but it
  would have to know every domain and reverse the dependencies of
  ADR-0004.

## Consequences

- New endpoints are protected by default.
- Every domain with user-owned data must scope its queries; this needs
  tests per domain.
- Sharing collections between household members will require a new
  decision and likely a richer permission model.
