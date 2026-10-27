# ADR-0014: Layers within a domain

- **Status:** Proposed
- **Date:** 2026-10-27

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

A client domain holds, besides its model, pages and components, four other
kinds of code: stores that keep what the server has, use cases that carry
out one intention of the user (deleting boxes, editing a mini), the state of
a screen (search, filters, selection) and the projections of the model a
screen shows (rows, groups). A first version of this decision put
everything several features share into one folder, `data/`. In the `hoard`
domain only 4 of its 21 files were stores; the rest were use cases, screen
state and projections, and stores began to write into one another.

## Decision

Inside each domain, code is split into a small, fixed set of folders, each
holding one kind of code. Both apps give the domain's own model a folder,
`models/`. On the server, use cases depend on interfaces (**ports**), and the
code that talks to the outside world implements them (ports and adapters).

### Model

- `models/` holds the types, value objects and business rules of the domain
  that only this app needs. It is plain TypeScript, free of frameworks like
  `libs/domain`, and depends on nothing in the domain; `util/` may use it.
- Model that both apps need lives in `libs/domain` instead. A part of
  `models/` moves there once the other app needs it as well, not before.
- Business rules live in `models/` or `libs/domain`, never in use cases,
  entry points, stores or components.

### Server

```text
apps/server/src/domains/<domain>/
├── api/                  ← contract for other domains (ADR-0004)
├── features/<feature>/   ← use cases with their entry points
├── models/               ← model only the server needs
├── ports/                ← abstract classes for what features need from outside
├── infrastructure/       ← implementations of ports
├── util/                 ← small helpers without business logic
└── <domain>.module.ts    ← binds ports to their implementations
```

```text
features ──▶ ports ◀── infrastructure
    └──────▶ models ◀──────┘             ports ──▶ models       all ──▶ util, libs/domain
```

- A **feature** is a vertical slice: a use case together with its entry
  point, such as a controller, a guard, an event listener or calls from
  other domains through `api/`. Entry points are the primary adapters.
- A **port** is an abstract class without behavior. It is both the
  interface and the injection token. The types in its signatures come from
  `models/` or `libs/domain`, so a port holds nothing but itself.
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
├── features/<feature>/   ← pages, smart components, what only they use
├── ui/                   ← presentational components shared by its features (ADR-0011)
├── application/          ← use cases, screen state and projections shared by its features
├── data/                 ← stores of what the server has, fixed and sample data
├── models/               ← model only the client needs
├── infrastructure/       ← access to external resources (the server)
├── util/
└── <domain>.routes.ts    ← entry point for the router
```

```text
features ──▶ application ──▶ data ──▶ infrastructure        features ──▶ ui, data, infrastructure
application ──▶ infrastructure                              all ──▶ models, util, libs/domain
```

- A **feature** holds its pages and smart components, and everything else
  only it uses: presentational components, the state of its screen, its use
  cases and the projections it shows. Keeping single-use code in its
  feature lets a feature be read, changed or removed as a whole.
- **UI** holds the presentational components that several features of the
  domain share.
- **Application** holds what several features of the domain share besides
  components: use cases, screen state shared across features (e.g. a list
  whose selection the frame around it acts on), code that combines several
  stores, and the projections of the model they show. It corresponds to
  the application services of DDD, which Steyer calls feature services or
  facades. Code moves here from a feature when a second feature needs it,
  not before.
- **Data** holds the stores and fixed or temporary data, such as sample data
  that stands in for the server while a screen is built before its backend.
  A store keeps one resource as the server has it (in memory or browser
  storage): it loads it, takes in what the server answers to changes and
  offers it as signals. A store stands alone: it uses only `infrastructure`,
  never another store. What combines stores, or writes to the server and
  then updates stores, is a use case in `application` or in a feature.
- The **model** is what the domain is, the client's types for it and the
  rules that follow from it. Stores hold the model; what lists and
  components show is derived from it, in `application` where several
  features share it, otherwise in the feature. The model changes slowly,
  what is shown of it often.
- **Infrastructure** is only the access to external resources, so local
  state never hides behind something that looks like an adapter. It maps
  responses into the model.
- Features read stores in `data` and use what `application` offers; a store
  loads through `infrastructure`. Where no local state is involved, features
  call `infrastructure` directly.
- `data` never imports `application`, `features` or `ui`; `application`
  never imports `features` or `ui`; `ui` never uses `application`, `data` or
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
  events and modules alike. `models/` has that criterion: types and rules,
  free of frameworks.
- **`application/` plus `adapters/primary` and `adapters/secondary` on the
  server**: textbook hexagonal naming, but splits every use case into a use
  case folder and a controller folder. The client's `application/` holds
  only what several features share; a feature keeps its own use cases.
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
  name for its stores only and sits beside `infrastructure`, not in place
  of it.
- **Local client data in `features/`, `infrastructure/` or `util/`**: no
  extra folder, but a store shared by several features belongs to none of
  them, `infrastructure` would mix external resources with local state,
  and `util` is for helpers.
- **Everything several client features share in `data/`** (the first
  version of this decision): one folder less, but `data/` has no criterion
  besides "shared". It collected use cases, screen state and projections
  next to the stores, and gave stores a reason to call each other.
- **Subfolders of `data/`** (`stores/`, `use-cases/`): the kinds are
  apart, but `data/` keeps two meanings, and the boundary checks need a
  rule per subfolder anyway.
- **Use cases as features of their own that pages compose** (as in
  Feature-Sliced Design, e.g. a feature `delete-minis` with its dialog):
  each use case is one folder with its UI, but features would import each
  other, and a feature would no longer be removable as a whole.
- **Stores that use other stores**: no extra class, but stores form chains
  and possibly cycles, and which store fills which becomes hidden; Steyer
  advises against it and coordinates stores with a service above them.
- **A store library (NgRx Signal Store)**: shared building blocks for
  stores, but it decides how stores are written, not where code lives, and
  adds a dependency.
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
- A type that becomes shared later moves from `models/` to `libs/domain`;
  imports change, the type does not.
- Stores and sample data have one place per domain; sample data is easy to
  find and remove once the server delivers.
- `data/` stays small, and a store changes only when its resource does.
  Combining stores costs a class in `application/` or a feature.
- The client has one folder more, and what a feature shares must be moved
  into `application/` when a second feature needs it.
- Existing code that holds model in `libs/domain`, `ports/` or `util/`
  although only one app needs it moves to `models/`.
- The folder rules are conventions until boundary checks are introduced in
  a later decision.
