# ADR-0014: Layers within a domain

- **Status:** Proposed
- **Date:** 2026-10-21

## Context

Client and server are sliced by domain (see ADR-0004), but nothing says how
code is arranged inside a domain. Without that, every new file is placed by
guesswork, and persistence code ends up next to business logic.

Business rules that both apps need already live outside the apps, in the
framework-free `libs/domain` (see ADR-0006). What remains in a server
domain is use cases, their entry points (controllers) and the code that
talks to MongoDB, Redis or the file system. Use cases should not depend on
that code: they must be testable without a database, and storage must be
replaceable without touching them.

## Decision

Inside each domain, code is split into a small, fixed set of folders, each
holding one kind of code. On the server, use cases depend on interfaces
(**ports**), and the code that talks to the outside world implements them
(ports and adapters).

### Server

```text
apps/server/src/domains/<domain>/
├── api/                  ← contract for other domains (ADR-0004)
├── features/<feature>/   ← one use case: controller + use case service
├── ports/                ← abstract classes for what features need from outside
├── infrastructure/       ← implementations of ports: Mongoose, Redis, files, push
├── util/                 ← small helpers without business logic
└── <domain>.module.ts    ← binds ports to their implementations
```

- A **feature** is one use case as a vertical slice: its controller (the
  entry point) and the service that carries it out. Mapping between
  protocol DTOs and domain models happens in the controller.
- A **port** is an abstract class without behavior, e.g. `UserRepository`
  or `PasswordHasher`. It is both the interface and the injection token.
- **Infrastructure** contains only implementations of ports, e.g.
  `MongoUserRepository extends UserRepository`, plus what they need
  (Mongoose schemas, mappers).
- The **domain module** is the only place that binds a port to its
  implementation.
- Business rules belong in `libs/domain`. Server-only business logic gets a
  folder of its own only when it actually exists.

Dependencies inside a server domain:

```text
features ──▶ ports ◀── infrastructure        all ──▶ util, libs/domain
```

- `features` never import `infrastructure`.
- Features never import each other. What several features need moves down
  into `ports/` or `util/`.
- `ports` contain no behavior and depend only on `libs/domain`.

### Client

```text
apps/client/src/app/domains/<domain>/
├── api/                  ← contract for other domains (ADR-0004)
├── features/<feature>/   ← pages, smart components, their state
├── ui/                   ← presentational components of this domain (ADR-0011)
├── infrastructure/       ← HTTP services using @greyhoarder/protocol
├── util/
└── <domain>.routes.ts    ← entry point for the router
```

The client has no ports: features use `infrastructure` directly and are
tested with Angular's dependency injection. `features` may use `ui`,
`infrastructure` and `util`; `ui` never uses `infrastructure`.

### Alternatives considered

- **Layers first, domains inside** (`api/`, `core/`, `infrastructure/` at
  the top, as in an earlier project): clear layers, but each domain is
  scattered across three trees.
- **A `core/` folder per domain**: one place for the inside, but without a
  criterion for what belongs there it collects services, interfaces,
  events and modules alike.
- **`application/` plus `adapters/primary` and `adapters/secondary`**:
  textbook hexagonal naming, but splits every use case into a use case
  folder and a controller folder.
- **Steyer's layer chain `feature → ui → data → util`**: well known and
  simple, but features depend on persistence code directly, so use cases
  cannot be tested or changed without it.
- **Ports on the client as well**: symmetric, but the client has one
  backend and Angular's dependency injection already allows replacing
  services in tests.

## Consequences

- Every file has one obvious place; reviews and agents can check placement
  by folder alone.
- Use cases are tested against fake implementations of their ports,
  without a database.
- Each port costs an abstract class and a binding, even when there is only
  one implementation.
- The folder rules are conventions until boundary checks are introduced in
  a later decision.
- The existing login page moves from `domains/auth/login/` to
  `domains/auth/features/login/`.
