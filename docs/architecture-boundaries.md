# Architecture: boundaries

Rules for the repository layout, domains, public APIs and shared code. They
apply to the client, the server and `libs/`.

## Repository layout

- `apps/client` is the Angular app, `apps/server` the NestJS app,
  `libs/domain` the shared domain models (`@greyhoarder/domain`),
  `libs/protocol` the API schemas (`@greyhoarder/protocol`),
  `libs/catalog` the community kit catalog as a git submodule (data only,
  no package).
- Apps never import from each other.
- Apps may depend on libs; libs never depend on apps.

_(derived from [ADR-0006](adr/0006-monorepo-with-shared-domain-code.md),
[ADR-0015](adr/0015-api-protocol-with-shared-zod-schemas.md),
[ADR-0020](adr/0020-community-kit-catalog.md))_

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

- Other domains import only from `<domain>/api/index.ts`.
- `api/` contains re-exports and narrow types or facades for other domains.
  No controllers, gateways or other external entry points.
- Code inside a domain never imports from its own `api/`.
- Don't bypass boundaries with re-exports, relative deep imports or path
  aliases.

_(derived from [ADR-0004](adr/0004-domain-slicing.md))_

## Layers inside a server domain

- A server domain contains only `api/`, `features/<feature>/`, `models/`,
  `ports/`, `infrastructure/`, `util/` and `<domain>.module.ts`.
- A feature is one use case or a few use cases on the same resource that
  change together; use cases with their own rules or dependencies are
  features of their own. It holds its entry point (controller, guard,
  gateway or event listener) and its service. Calls from other domains
  through `api/` are an entry point as well. Entry points map between
  protocol DTOs and domain models.
- Entry points are the primary adapters, implementations in
  `infrastructure/` the secondary adapters. Neither carries an `adapter`
  suffix; the NestJS kind or the port names the role.
- Other domains read through a read-only port named `<Entity>Queries`
  (e.g. `UserQueries`), published in `api/` and implemented by the
  repository; never add a writing method to it. Writes and access to
  rule-protected data go through a feature published in `api/`.
- Name files with a kind suffix (`.controller.ts`, `.service.ts`,
  `.guard.ts`, `.dto.ts`, `.error.ts`). Controllers and services sit
  directly in the feature folder; every other kind always goes into a
  subfolder named after it (`guards/`, `dtos/`, `errors/`), even for a
  single file. Never create a feature named after a kind
  (`features/guards/`).
- `models/` holds the types, value objects and business rules of the domain
  that only the server needs (e.g. `UserCredentials`, the state of a
  catalog import). It imports nothing from NestJS, Mongoose, RxJS or other
  frameworks, and nothing from the domain except `util/`.
- `ports/` holds only abstract classes without behavior; each is the
  interface and the injection token. No string tokens. Ports depend only
  on `models/` and `@greyhoarder/domain`; the types in their signatures
  live there, not in `ports/`.
- `infrastructure/` holds only implementations of ports and what they need
  (Mongoose schemas, mappers).
- `infrastructure/` is organized by port; the technology appears only in
  the file name (`<technology>-<port>.ts`, e.g.
  `redis-session-registry.ts`). A port gets a subfolder only when its
  adapter has several files; never group by technology (`redis/`,
  `mongo/`) or by kind (`repositories/`).
- An adapter's schemas (Mongoose schemas, Zod schemas of the files it
  reads) go into a subfolder `schemas/` of its port's folder, even for a
  single file; it is the only folder by kind inside `infrastructure/`.
- Only `<domain>.module.ts` binds ports to implementations.
- `util/` holds small helpers without business logic.
- Allowed: `features → ports`, `features → models`,
  `infrastructure → ports`, `infrastructure → models`, `ports → models`;
  every folder may use `util/` and `@greyhoarder/domain`.
- `features` never import `infrastructure`; features never import each
  other. Code several features need moves to `models/`, `ports/` or
  `util/`.
- Business rules belong in `models/`, or in `libs/domain` when both apps
  need them; never in features or `infrastructure/`.

_(derived from [ADR-0014](adr/0014-layers-within-a-domain.md))_

## App level on the server

- Besides `shared/` (see below), code outside `domains/` is either the
  composition root or platform-specific code.
- The composition root is `main.ts`, `app.module.ts`, `config/` and
  modules next to them that assemble the app (global pipes, serving the
  web app).
- `apps/server/src/platform/` holds platform-specific code: connections to
  physical stores (MongoDB, Redis), runtime and OS adapters, and the
  middleware bound to them (e.g. sessions).
- Neither holds endpoints; every endpoint is an entry point in a domain.
- Neither holds business logic, and neither imports from a domain except
  through its `api/`.

_(derived from [ADR-0014](adr/0014-layers-within-a-domain.md),
[ADR-0017](adr/0017-server-serves-the-web-app.md))_

## Layers inside a client domain

- A client domain contains only `api/`, `features/<feature>/`, `ui/`,
  `data/`, `models/`, `infrastructure/`, `util/` and `<domain>.routes.ts`.
- `features/` holds pages, smart components and their state, and the
  presentational components only that feature uses, each in a folder of
  its own (`features/boxes/box-card/`).
- `ui/` holds the presentational components that at least two features of
  the domain share. A component moves there when a second feature needs
  it, never in advance.
- `data/` holds the data the client keeps locally: stores shared by
  features of the domain (in memory or browser storage) and fixed or
  temporary data, e.g. sample data named `sample-<subject>.ts` that stands
  in for the server until its adapter exists.
- `models/` holds the types, value objects and business rules of the domain
  that only the client needs: what stores hold and features and
  components show (e.g. `BoxRow`, `MiniRow`) and the facts derived from
  them. It imports nothing from Angular, RxJS or other frameworks, and
  nothing from the domain except `util/`.
- `infrastructure/` holds only access to external resources: one HTTP
  adapter per server controller, named `http-<resource>-adapter.ts`
  (`HttpSetupAdapter`). It maps between protocol DTOs and domain models
  (`models/` or `@greyhoarder/domain`); features never see DTOs.
- `util/` holds small helpers without business logic.
- Allowed: `features → ui`, `features → data`, `features → infrastructure`,
  `data → infrastructure`; every folder may use `models/`, `util/` and
  `@greyhoarder/domain`.
- `ui` never uses `data` or `infrastructure`; `data` never imports
  `features` or `ui`; features never import each other.
- Business rules belong in `models/`, or in `libs/domain` when both apps
  need them; never in components, stores or `infrastructure/`.
- No ports on the client.

_(derived from [ADR-0014](adr/0014-layers-within-a-domain.md))_

## App level on the client

- Besides `shared/` (see below), code outside `domains/` is the app level:
  `app.ts`, `app.config.ts`, `app.routes.ts` and `shell/`.
- The app level assembles domains and uses them only through their
  `api/`. It holds no business logic and no HTTP adapters.
- `shell/app-shell.ts` is the layout route above every route behind the
  login; login and setup stay outside it. Its navigation entries are a
  fixed list in the shell.

_(derived from [ADR-0004](adr/0004-domain-slicing.md),
[ADR-0014](adr/0014-layers-within-a-domain.md))_

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

## Events between domains

- Call directly within a domain and across domains through `api/`. Use
  events only to react across a domain boundary against the direction of
  dependency, or for side effects outside the use case.
- Publish through the service in `apps/server/src/shared/events/`, never
  through `EventEmitter2` directly:
  - `await events.dispatch(event)` for synchronous events: the listeners
    are part of the use case, and a listener error aborts it;
  - `events.notify(event)` for asynchronous events: side effects whose
    errors are logged and whose loss is acceptable.
- Name synchronous events in the present participle (`UserDeleting`) and
  asynchronous events in the past tense (`BoxAdded`).
- Events are classes, never strings. Define an event where it is published
  and re-export it through the publishing domain's `api/`.
- Listeners are entry points in `features/` of the listening domain and
  are idempotent.
- Destructive flows: make the subject inactive, dispatch the synchronous
  event, then remove the subject.
- No command bus, no event sourcing, no message broker.

_(derived from [ADR-0016](adr/0016-in-process-events-between-domains.md))_

## Shared domain models

- Types and rules needed by both client and server belong in
  `libs/domain`, not duplicated in the apps.
- Types and rules only one app needs belong in that app's `models/`, not in
  `libs/domain`. They move to `libs/domain` once the other app needs them,
  not in advance.
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
