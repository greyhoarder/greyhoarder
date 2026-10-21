# Architecture: boundaries

Rules for the repository layout, domains, public APIs and shared code. They
apply to the client, the server and `libs/`.

## Repository layout

- `apps/client` is the Angular app, `apps/server` the NestJS app,
  `libs/domain` the shared domain models (`@greyhoarder/domain`),
  `libs/protocol` the API schemas (`@greyhoarder/protocol`).
- Apps never import from each other.
- Apps may depend on libs; libs never depend on apps.

_(derived from [ADR-0006](adr/0006-monorepo-with-shared-domain-code.md),
[ADR-0015](adr/0015-api-protocol-with-shared-zod-schemas.md))_

## Domains

- `users`: accounts, roles, profiles, initial setup, user management.
- `auth`: login, logout, sessions, guards.
- Domains live in `apps/client/src/app/domains/<domain>/` and
  `apps/server/src/domains/<domain>/`, with the same name in both apps.
- New domains are created only on explicit request. A new domain and its
  allowed dependencies are added to this guide when it is created.

_(derived from [ADR-0004](adr/0004-domain-slicing.md),
[ADR-0007](adr/0007-local-user-accounts.md),
[ADR-0009](adr/0009-sessions-with-redis.md))_

## Domain dependencies

- `users` depends on no other domain.
- `auth` depends only on `users`.
- No domain imports from `auth` to protect its endpoints; the
  authorization decorators live in `apps/server/src/shared/auth/`.

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

## Layers inside a server domain

- A server domain contains only `api/`, `features/<feature>/`, `ports/`,
  `infrastructure/`, `util/` and `<domain>.module.ts`.
- A feature is one use case: its entry point (controller, guard, gateway
  or event listener) and its use case service. Entry points map between
  protocol DTOs and domain models.
- Name files with NestJS suffixes (`.controller.ts`, `.guard.ts`,
  `.service.ts`). Use a subfolder by kind (e.g. `guards/`) inside a feature
  only when it has several files of that kind; never create a feature
  named after a kind (`features/guards/`).
- `ports/` holds only abstract classes without behavior; each is the
  interface and the injection token. No string tokens.
- `infrastructure/` holds only implementations of ports and what they need
  (Mongoose schemas, mappers).
- `infrastructure/` is organized by port; the technology appears only in
  the file name (`<technology>-<port>.ts`, e.g.
  `redis-session-registry.ts`). A port gets a subfolder only when its
  adapter has several files; never group by technology (`redis/`,
  `mongo/`) or by kind (`repositories/`).
- Connections, clients and their configuration live at app level
  (`AppModule`, `apps/server/src/shared/`), never in a domain.
- Only `<domain>.module.ts` binds ports to implementations.
- Allowed: `features → ports`, `infrastructure → ports`; every folder may
  use `util/` and `@greyhoarder/domain`.
- `features` never import `infrastructure`; features never import each
  other. Code several features need moves to `ports/` or `util/`.
- Business rules belong in `libs/domain`, not in features.

_(derived from [ADR-0014](adr/0014-layers-within-a-domain.md))_

## Layers inside a client domain

- A client domain contains only `api/`, `features/<feature>/`, `ui/`,
  `infrastructure/`, `util/` and `<domain>.routes.ts`.
- `features/` holds pages, smart components and their state; `ui/` holds
  the domain's presentational components; `infrastructure/` holds HTTP
  services.
- Allowed: `features → ui`, `features → infrastructure`; every folder may
  use `util/` and `@greyhoarder/domain`.
- `ui` never uses `infrastructure`; features never import each other.
- No ports on the client.

_(derived from [ADR-0014](adr/0014-layers-within-a-domain.md))_

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
- Client: HTTP services use the inferred types; never declare request or
  response types by hand.
- Only entry points in `features/` (server) and `infrastructure/` (client)
  import `@greyhoarder/protocol`.

_(derived from [ADR-0015](adr/0015-api-protocol-with-shared-zod-schemas.md))_
