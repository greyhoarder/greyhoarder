# Architecture: boundaries

Rules for the repository layout, domains, public APIs and shared code. They
apply to the client, the server and `libs/`.

## Repository layout

- `apps/client` is the Angular app, `apps/server` the NestJS app,
  `libs/domain` the shared domain models (`@greyhoarder/domain`).
- Apps never import from each other.
- Apps may depend on libs; libs never depend on apps.

_(derived from [ADR-0006](adr/0006-monorepo-with-shared-domain-code.md))_

## Domains
- `users`: accounts, roles, profiles, initial setup, user management.
- `auth`: login, logout, sessions, guards.
- Domains live in `apps/client/src/app/domains/<domain>/` and
  `apps/server/src/domains/<domain>/`, with the same name in both apps.
- New domains are created only on explicit request.

_(derived from [ADR-0004](adr/0004-domain-slicing.md),
[ADR-0007](adr/0007-local-user-accounts.md),
[ADR-0009](adr/0009-sessions-with-redis.md))_

## Domain dependencies

- `users` depends on no other domain.
- `auth` depends only on `users`.
- Allowed directions: `collection → catalog`, `rules → catalog`. Nothing
  depends on `collection` or `rules`.
- Every domain may use the guards and decorators from `auth/api`.

_(derived from [ADR-0004](adr/0004-domain-slicing.md),
[ADR-0007](adr/0007-local-user-accounts.md),
[ADR-0009](adr/0009-sessions-with-redis.md),
[ADR-0010](adr/0010-authorization-and-data-ownership.md))_

## Public API

- Other domains import only from `<domain>/api/index.ts`.
- `api/` contains re-exports and narrow types or facades for other domains.
  No controllers, gateways or other external entry points.
- Code inside a domain never imports from its own `api/`.
- Don't bypass boundaries with re-exports, relative deep imports or path
  aliases.

_(derived from [ADR-0004](adr/0004-domain-slicing.md))_

## Shared code

- Cross-cutting code without business logic lives in
  `apps/client/src/app/shared/` and `apps/server/src/shared/`.
- `shared/` never imports from a domain.
- Code moves to `shared/` only when two domains need it and the user
  agrees.

_(derived from [ADR-0004](adr/0004-domain-slicing.md))_

## Server modules and data ownership

- One Nest module per domain; its `exports` match its `api/`.
- No `forwardRef()` between domain modules. A domain that must react to
  something in a domain it may not depend on listens to an event instead.
- Each domain owns its persisted data. Other domains read it only through
  the owning domain's `api/`, never through its storage.

_(derived from [ADR-0004](adr/0004-domain-slicing.md))_

## Shared domain models

- Types and rules needed by both client and server belong in
  `libs/domain`, not duplicated in the apps.
- `libs/domain` imports nothing from Angular, NestJS, Mongoose, RxJS or
  other frameworks.
- `libs/domain/<domain>/` uses the same domain names and boundary rules as
  the apps.
- Each `libs/domain/<domain>/` exposes its public API in `api/index.ts`,
  published as `@greyhoarder/domain/<domain>` through the package's
  `exports`; everything else in it is internal.
- Import shared models by package name (`@greyhoarder/domain/<domain>`),
  never by relative path.
- IDs in shared models are strings; no ObjectId outside the server's
  persistence code.
- Mongoose schemas and documents never leave the server.

_(derived from [ADR-0006](adr/0006-monorepo-with-shared-domain-code.md))_
