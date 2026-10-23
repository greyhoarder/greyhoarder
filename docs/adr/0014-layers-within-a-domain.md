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
├── features/<feature>/   ← use cases with their entry points
├── ports/                ← abstract classes for what features need from outside
├── infrastructure/       ← implementations of ports
├── util/                 ← small helpers without business logic
└── <domain>.module.ts    ← binds ports to their implementations
```

```text
features ──▶ ports ◀── infrastructure        all ──▶ util, libs/domain
```

- A **feature** is a vertical slice: a use case together with its entry
  point, such as a controller, a guard, an event listener or calls from
  other domains through `api/`. Entry points are the primary adapters.
- A **port** is an abstract class without behavior. It is both the
  interface and the injection token.
- **Infrastructure** holds the implementations of ports, the secondary
  adapters. Replacing a technology means adding an implementation and
  changing its binding; features stay untouched.
- The **domain module** is the only place that binds a port to its
  implementation.
- Features depend on ports, never on infrastructure, and never on each
  other.
- Business rules belong in `libs/domain`.

### Client

```text
apps/client/src/app/domains/<domain>/
├── api/                  ← contract for other domains (ADR-0004)
├── features/<feature>/   ← pages, smart components, their state
├── ui/                   ← presentational components shared by its features (ADR-0011)
├── data/                 ← data held locally: stores, fixed and sample data
├── infrastructure/       ← access to external resources (the server)
├── util/
└── <domain>.routes.ts    ← entry point for the router
```

```text
features ──▶ data ──▶ infrastructure        features ──▶ ui, infrastructure        all ──▶ util, libs/domain
```

- A **feature** holds its pages and smart components and the
  presentational components only it uses; **ui** holds those that several
  features of the domain share. Keeping single-use components in their
  feature lets a feature be read, changed or removed as a whole.
- **Data** is what the client holds locally: stores with state that
  several features of the domain share (in memory or browser storage), and
  fixed or temporary data, such as sample data that stands in for the
  server while a screen is built before its backend.
- **Infrastructure** is only the access to external resources, so local
  state never hides behind something that looks like an adapter.
- Features read and change local data through `data`; a store loads and
  saves through `infrastructure`. Where no local state is involved,
  features call `infrastructure` directly.
- `data` never imports `features` or `ui`; `ui` never uses `data` or
  `infrastructure`.

The client has no ports: features use `infrastructure` directly and are
tested with Angular's dependency injection.

### Outside the domains

Code that belongs to no domain, such as the composition of the app and
platform-specific code, lives at app level, outside `domains/`.

How features are cut, how files and folders inside these layers are named,
and where app-level code goes are rules in
`docs/architecture-boundaries.md`. They are refined there as cases arise,
without a new decision.

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
  cannot be tested or changed without it. The client's `data` borrows the
  name for local data only and sits beside `infrastructure`, not in place
  of it.
- **Local client data in `features/`, `infrastructure/` or `util/`**: no
  extra folder, but a store shared by several features belongs to none of
  them, `infrastructure` would mix external resources with local state,
  and `util` is for helpers.
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
- Shared client state and sample data have one place per domain; sample
  data is easy to find and remove once the server delivers.
- The folder rules are conventions until boundary checks are introduced in
  a later decision.
