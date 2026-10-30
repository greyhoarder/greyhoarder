# Architecture: boundaries

Rules for the repository layout, domains, public APIs and shared code. They
apply to the client, the server and `libs/`. The layers inside a domain and
the app level of each app are in
[architecture-boundaries-server.md](architecture-boundaries-server.md) and
[architecture-boundaries-client.md](architecture-boundaries-client.md).

Sheriff checks the dependencies between domains, layers, the app level and
`shared/` (`sheriff.config.ts` in each app, run by `npm run lint`); the lists
of allowed dependencies in its configs follow these guides. Other rules a tool
can check are architecture tests in `tests/architecture` (see
[architecture-testing.md](architecture-testing.md)). A rule and its check
change together.

## Repository layout

- `apps/client` is the Angular app, `apps/server` the NestJS app,
  `libs/domain` the shared domain models (`@greyhoarder/domain`),
  `libs/protocol` the API schemas (`@greyhoarder/protocol`),
  `libs/catalog` the community kit catalog as a git submodule (data only,
  no package).
- `apps/` holds only what is shipped. Test suites that check the apps from
  outside are workspaces of their own in `tests/`: `tests/e2e` and
  `tests/architecture`.
- Apps never import from each other.
- Apps may depend on libs; libs never depend on apps.
- Nothing in `apps/` or `libs/` depends on `tests/`.

_(derived from [ADR-0006](adr/0006-monorepo-with-shared-domain-code.md),
[ADR-0015](adr/0015-api-protocol-with-shared-zod-schemas.md),
[ADR-0020](adr/0020-community-kit-catalog.md),
[ADR-0013](adr/0013-browser-e2e-tests-with-playwright.md),
[ADR-0024](adr/0024-architecture-tests-with-sheriff-and-archunitts.md))_

## Domains

- `users`: accounts and their storage (including password hashes), roles,
  user management (roles, disabling, deleting).
- `auth`: everything that works with passwords (hashing, verifying,
  creating accounts including the initial setup, changing and resetting
  passwords), login, logout, sessions, the global guard.
- `instance`: state and settings of the instance as a whole (health, later
  instance settings).
- `dashboard`: the start page after signing in; for now only in the
  client.
- `hoard`: boxes, kits, minis, the vocabulary of parts and the
  workbench of each user (see [docs/domains/hoard.md](domains/hoard.md)).
- `catalog`: the kits and factions of the community catalog, their import
  and the queries for them (see
  [docs/domains/catalog.md](domains/catalog.md)).
- Domains live in `apps/client/src/app/domains/<domain>/` and
  `apps/server/src/domains/<domain>/`, with the same name in both apps.
- New domains are created only on explicit request. A new domain and its
  allowed dependencies are added to this guide when it is created.
- The files inside a domain never import each other in a cycle; this
  applies to the domains in `libs/` as well.

_(derived from [ADR-0004](adr/0004-domain-slicing.md),
[ADR-0007](adr/0007-local-user-accounts.md),
[ADR-0009](adr/0009-sessions-with-redis.md),
[ADR-0018](adr/0018-end-to-end-tests-with-an-instance-per-worker.md),
[ADR-0019](adr/0019-hobby-data-model.md),
[ADR-0020](adr/0020-community-kit-catalog.md))_

## Domain dependencies

- `users` depends on no other domain.
- `instance` depends on no other domain.
- `dashboard` depends only on `auth` (the signed-in user) and `hoard`
  (what it shows about the hoard).
- `hoard` depends only on `catalog` (reading catalog kits and factions).
- `catalog` depends on no other domain.
- `auth` depends only on `users`. It reads and writes password hashes only
  through `users/api`; no other domain receives a hash.
- No domain imports from `auth` to protect its endpoints; the
  authorization decorators live in `apps/server/src/shared/auth/`.

_(derived from [ADR-0004](adr/0004-domain-slicing.md),
[ADR-0007](adr/0007-local-user-accounts.md),
[ADR-0009](adr/0009-sessions-with-redis.md),
[ADR-0010](adr/0010-authorization-and-data-ownership.md),
[ADR-0020](adr/0020-community-kit-catalog.md))_

## Public API

- Other domains import only from `<domain>/api/index.ts`. Every layer may
  do so except `models/`, `ports/` and `api/`; `api/` never re-exports
  another domain.
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
- Every layer of a domain may use `shared/` except `models/` and `ports/`.
- Code moves to `shared/` only when two domains need it and the user
  agrees.

_(derived from [ADR-0004](adr/0004-domain-slicing.md))_

## Shared domain models

- `libs/domain` holds the types both apps use, the terms of the domain
  language defined on them (`isGone`, `hasReached`) and the invariants both
  sides check (`parseMini`, `newBoxes`), never duplicated in the apps.
- A pure function that works only on shared types and defines a term or an
  invariant of the domain belongs in `libs/domain`, even if only one app
  uses it so far.
- Types only one app knows, and the rules on them, belong in that app's
  `models/`. They move to `libs/domain` once the other app needs them, not
  in advance. Secrets and server-only state (e.g. a password hash) never
  do.
- `libs/domain` imports nothing from Angular, NestJS, Mongoose, RxJS or
  other frameworks.
- `libs/domain/<domain>/` uses the same domain names and boundary rules as
  the apps.
- Each `libs/domain/<domain>/` exposes its public API in `index.ts`
  (no `api/` folder), published as `@greyhoarder/domain/<domain>` through
  the package's `exports`; everything else in it is internal. Domains
  inside the library import each other only through that `index.ts`.
- Import shared models by package name (`@greyhoarder/domain/<domain>`),
  never by relative path.
- IDs in shared models are strings; no ObjectId outside the server's
  persistence code.
- Mongoose schemas and documents never leave the server.

_(derived from [ADR-0006](adr/0006-monorepo-with-shared-domain-code.md))_

## API protocol

- Request and response shapes of the REST API are Zod schemas in
  `libs/protocol/<domain>/`.
- Each `libs/protocol/<domain>/` exposes its schemas in `index.ts` (no
  `api/` folder), published as `@greyhoarder/protocol/<domain>`; import by
  package name, never by relative path.
- `libs/protocol` depends only on `zod` and `@greyhoarder/domain`.
- Name each schema `<shape>Schema` and export its inferred type as
  `<Shape>`, e.g. `loginRequestSchema` and `LoginRequest`.
- No ObjectId, Mongoose types or persistence-only fields in protocol
  schemas.
- Server: requests are validated and responses serialized through their
  protocol schema with `nestjs-zod`; no `class-validator`.
- Client: HTTP adapters use the inferred types; never declare request or
  response types by hand.
- Only entry points in `features/` (server) and `infrastructure/` (client)
  import `@greyhoarder/protocol`.

_(derived from [ADR-0015](adr/0015-api-protocol-with-shared-zod-schemas.md))_
