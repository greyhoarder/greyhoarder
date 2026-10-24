# ADR-0014: Layers within a domain

- **Status:** Proposed
- **Date:** 2026-10-21

## Context

Client and server are sliced by domain (see ADR-0004), but nothing says how
code is arranged inside a domain. Without that, every new file is placed by
guesswork, and persistence code ends up next to business logic.

Each domain has a model: the types, value objects and rules of its area.
Only part of that model is needed by both apps; that part lives in the
framework-free `libs/domain` (see ADR-0006), shared deliberately and kept
small. The rest is known to one app only: on the server, for example, the
state of a catalog import or a user together with the password hash, which
must never reach the client; on the client, the rows its stores hold and the
facts derived from them. Without a place of its own, this model ends up
either in `libs/domain`, where the other app can import it, or in folders
meant for something else, such as `ports/` or `util/`.

Besides its model, a server domain holds use cases, their entry points
(controllers) and the code that talks to MongoDB, Redis or the file system.
Use cases should not depend on that code: they must be testable without a
database, and storage must be replaceable without touching them.

## Decision

Inside each domain, code is split into a small, fixed set of folders, each
holding one kind of code. Both apps give the domain's own model a folder,
`model/`. On the server, use cases depend on interfaces (**ports**), and the
code that talks to the outside world implements them (ports and adapters).

### Model

- `model/` holds the types, value objects and business rules of the domain
  that only this app needs. It is plain TypeScript, free of frameworks like
  `libs/domain`, and depends on nothing in the domain except `util/`.
- Model that both apps need lives in `libs/domain` instead. A part of
  `model/` moves there once the other app needs it as well, not before.
- Business rules live in `model/` or `libs/domain`, never in use cases,
  entry points, stores or components.

### Server

```text
apps/server/src/domains/<domain>/
├── api/                  ← contract for other domains (ADR-0004)
├── features/<feature>/   ← use cases with their entry points
├── model/                ← model only the server needs
├── ports/                ← abstract classes for what features need from outside
├── infrastructure/       ← implementations of ports
├── util/                 ← small helpers without business logic
└── <domain>.module.ts    ← binds ports to their implementations
```

```text
features ──▶ ports ◀── infrastructure
    └──────▶ model ◀───────┘            ports ──▶ model        all ──▶ util, libs/domain
```

- A **feature** is a vertical slice: a use case together with its entry
  point, such as a controller, a guard, an event listener or calls from
  other domains through `api/`. Entry points are the primary adapters.
- A **port** is an abstract class without behavior. It is both the
  interface and the injection token. The types in its signatures come from
  `model/` or `libs/domain`, so a port holds nothing but itself.
- **Infrastructure** holds the implementations of ports, the secondary
  adapters. Replacing a technology means adding an implementation and
  changing its binding; features stay untouched.
- The **domain module** is the only place that binds a port to its
  implementation.
- Features depend on ports and the model, never on infrastructure, and
  never on each other.

### Client

```text
apps/client/src/app/domains/<domain>/
├── api/                  ← contract for other domains (ADR-0004)
├── features/<feature>/   ← pages, smart components, their state
├── ui/                   ← presentational components shared by its features (ADR-0011)
├── data/                 ← data held locally: stores, fixed and sample data
├── model/                ← model only the client needs
├── infrastructure/       ← access to external resources (the server)
├── util/
└── <domain>.routes.ts    ← entry point for the router
```

```text
features ──▶ data ──▶ infrastructure        features ──▶ ui, infrastructure        all ──▶ model, util, libs/domain
```

- A **feature** holds its pages and smart components and the
  presentational components only it uses; **ui** holds those that several
  features of the domain share. Keeping single-use components in their
  feature lets a feature be read, changed or removed as a whole.
- **Data** is what the client holds locally: stores with state that
  several features of the domain share (in memory or browser storage), and
  fixed or temporary data, such as sample data that stands in for the
  server while a screen is built before its backend.
- The **model** is what stores hold and features and components show: the
  client's types for the domain and the facts derived from them. Stores
  keep state, the model knows what it means.
- **Infrastructure** is only the access to external resources, so local
  state never hides behind something that looks like an adapter. It maps
  responses into the model.
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
  events and modules alike. `model/` has that criterion: types and rules,
  free of frameworks.
- **`application/` plus `adapters/primary` and `adapters/secondary`**:
  textbook hexagonal naming, but splits every use case into a use case
  folder and a controller folder.
- **The whole model in `libs/domain`**, with a separate entry point for
  what only one app needs and a lint rule that keeps the other app out:
  one folder less, but the shared library no longer shows what is
  deliberately shared, and a missing lint rule is enough to put a password
  hash into the client bundle.
- **Model types next to the code that uses them** (in `ports/`, `util/` or
  a feature): no extra folder, but ports and helpers become the place for
  everything that has none, and rules spread across use cases.
- **The folder named `domain/`**: the usual term, but it collides with
  `domains/<domain>/` and `@greyhoarder/domain`.
- **Steyer's layer chain `feature → ui → data → util`**: well known and
  simple, but features depend on persistence code directly, so use cases
  cannot be tested or changed without it. The client's `data` borrows the
  name for local data only and sits beside `infrastructure`, not in place
  of it.
- **Local client data in `features/`, `infrastructure/` or `util/`**: no
  extra folder, but a store shared by several features belongs to none of
  them, `infrastructure` would mix external resources with local state,
  and `util` is for helpers.
- **A model folder on the server only**: smaller change, but the client has
  the same gap, and its row types and their rules would stay in `util/`.
- **Ports on the client as well**: symmetric, but the client has one
  backend and Angular's dependency injection already allows replacing
  services in tests.

## Consequences

- Every file has one obvious place; reviews and agents can check placement
  by folder alone.
- `libs/domain` holds only what both apps share, so changing it means
  changing a contract between them.
- Model and rules are tested without frameworks, wherever they live.
- Use cases are tested against fake implementations of their ports,
  without a database.
- Each port costs an abstract class and a binding, even when there is only
  one implementation.
- A type that becomes shared later moves from `model/` to `libs/domain`;
  imports change, the type does not.
- Shared client state and sample data have one place per domain; sample
  data is easy to find and remove once the server delivers.
- Existing code that holds model in `libs/domain`, `ports/` or `util/`
  although only one app needs it moves to `model/`.
- The folder rules are conventions until boundary checks are introduced in
  a later decision.
