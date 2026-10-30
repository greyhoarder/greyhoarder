# Architecture: boundaries on the server

Rules for the layers inside a server domain, the app level of the server,
its Nest modules, startup steps and the events between its domains. The
rules for both apps and `libs/` are in
[architecture-boundaries.md](architecture-boundaries.md).

## Layers inside a server domain

- A server domain contains only `api/`, `features/<feature>/`, `models/`,
  `ports/`, `infrastructure/`, `util/` and `<domain>.module.ts`.
- A feature is one use case or a few use cases on the same resource that
  change together; use cases with their own rules or dependencies are
  features of their own. It holds its entry point (controller, guard,
  gateway, event listener or startup step) and its service. Calls from other domains
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
  `.guard.ts`, `.dto.ts`, `.error.ts`, `.startup-step.ts`). Controllers and
  services sit directly in the feature folder; every other kind always goes
  into a subfolder named after it (`guards/`, `dtos/`, `errors/`,
  `startup-steps/`), even for a single file. Never create a feature named
  after a kind (`features/guards/`).
- `models/` holds the types, value objects and business rules of the domain
  that only the server needs (e.g. `UserCredentials`, the state of a
  catalog import). It is the innermost layer: it imports nothing from
  NestJS, Mongoose, RxJS or other frameworks and nothing from its own
  domain, only `@greyhoarder/domain`.
- `ports/` holds only abstract classes without behavior; each is the
  interface and the injection token. No string tokens. Ports depend only
  on `models/` and `@greyhoarder/domain`; the types in their signatures
  live there, not in `ports/`.
- `infrastructure/` holds only implementations of ports and what they need
  (Mongoose schemas, mappers), and the domain's migrations in
  `infrastructure/migrations/` (see "Startup steps").
- `infrastructure/` is organized by port; the technology appears only in
  the file name (`<technology>-<port>.ts`, e.g.
  `redis-session-registry.ts`). A port gets a subfolder only when its
  adapter has several files; never group by technology (`redis/`,
  `mongo/`) or by kind (`repositories/`).
- An adapter's schemas (Mongoose schemas, Zod schemas of the files it
  reads) go into a subfolder `schemas/` of its port's folder, even for a
  single file. It and `migrations/` are the only folders by kind inside
  `infrastructure/`.
- Only `<domain>.module.ts` binds ports to implementations.
- `util/` holds small helpers without business logic.
- Allowed: `features → ports`, `features → models`,
  `infrastructure → ports`, `infrastructure → models`, `ports → models`,
  `util → models`; every folder except `models/` and `ports/` may use
  `util/`, and every folder may use `@greyhoarder/domain`.
- `features` never import `infrastructure`; features never import each
  other. Code several features need moves to `models/`, `ports/` or
  `util/`.
- Business rules belong in `models/`, or in `libs/domain` by the criterion
  under "Shared domain models" in architecture-boundaries.md; never in
  features or `infrastructure/`.

_(derived from [ADR-0014](adr/0014-layers-within-a-domain.md),
[ADR-0023](adr/0023-startup-sequence-and-migrations.md))_

## App level on the server

- Besides `shared/` (see "Shared code" in architecture-boundaries.md), code
  outside `domains/` is either the composition root or platform-specific
  code.
- The composition root is `main.ts`, `app.module.ts`, `config/` and
  modules next to them that assemble the app (global pipes, serving the
  web app).
- `apps/server/src/platform/` holds platform-specific code: connections to
  physical stores (MongoDB, Redis), runtime and OS adapters, and the
  middleware bound to them (e.g. sessions).
- Neither holds endpoints; every endpoint is an entry point in a domain.
- Neither holds business logic, and neither imports from a domain except
  through its `api/` or its `<domain>.module.ts`.
- Inside a domain, `features/`, `infrastructure/` and `<domain>.module.ts`
  may use `config/`; only `infrastructure/` and `<domain>.module.ts` may use
  `platform/`. `shared/` uses neither.
- `platform/` may use `config/`.

_(derived from [ADR-0014](adr/0014-layers-within-a-domain.md),
[ADR-0017](adr/0017-server-serves-the-web-app.md))_

## Server modules and data ownership

- One Nest module per domain; its `exports` match its `api/`.
- No `forwardRef()`, neither between domain modules nor between
  providers. A domain that must react to something in a domain it may not
  depend on listens to an event instead.
- Each domain owns its persisted data. Other domains read it only through
  the owning domain's `api/`, never through its storage.

_(derived from [ADR-0004](adr/0004-domain-slicing.md))_

## Startup steps

- A startup step is a provider that implements `StartupStep` (`domain`,
  `version`, `id`, `runs`, `run(context)`) and is marked as a step by its
  decorator. Both live in `apps/server/src/shared/startup/`, without
  business logic and without domain names.
- `version` is the release that introduces the step; `id` is unique within
  its domain and sortable, e.g. `0001-rename-box-tags`.
- A domain's migrations live in `<domain>/infrastructure/migrations/`. A
  step that runs a use case of its domain is an entry point in that
  feature's `startup-steps/` and contains no logic of its own.
- The sequence that runs the steps lives in `instance/features/startup/`
  and knows no domain. The composition root holds the order of the domains
  for the steps, matching "Domain dependencies" in
  architecture-boundaries.md; a step of a domain missing from it stops the
  start.
- No domain depends on `instance` to register a step, and `instance`
  depends on no domain.
- What a migration may do is in
  [architecture-persistence.md](architecture-persistence.md), "Migrations".

_(derived from [ADR-0023](adr/0023-startup-sequence-and-migrations.md))_

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
