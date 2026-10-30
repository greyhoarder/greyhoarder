# Architecture: boundaries on the client

Rules for the layers inside a client domain and the app level of the
client. The rules for both apps and `libs/` are in
[architecture-boundaries.md](architecture-boundaries.md).

## Layers inside a client domain

- A client domain contains only `api/`, `features/<feature>/`, `ui/`,
  `application/`, `data/`, `models/`, `infrastructure/`, `util/` and
  `<domain>.routes.ts`.
- `features/` holds pages and smart components, and everything else only
  that feature uses: presentational components, each in a folder of its
  own (`features/box-list/box-card/`), and the state of its screen, its use
  cases and the projections it shows (e.g. `features/box-detail/mini-group.ts`).
  Features are named after what they show or do, e.g. `box-list`,
  `box-detail`, `add-box`.
- `ui/` holds the presentational components, directives and pipes that at
  least two features of the domain share. One moves there when a second
  feature needs it, never in advance.
- `application/` holds what at least two features of the domain share
  besides components:
  - use cases: one intention of the user, carried out through
    `infrastructure/` and the stores, named after it (`BoxesDeletion`,
    `MiniEditor`);
  - screen state: search, filters, selection and what follows from them,
    named after what it shows (`MinisList`, `HoardView`);
  - code that combines several stores (`FactionNames`);
  - the projections of the model these show, e.g. the rows of a list
    (`BoxRow`, `MiniRow`), as types and pure functions;
  - what other domains read through `api/` (`HoardByFaction`).

  Code moves there from a feature when a second feature needs it, never in
  advance.
- `application/` is grouped by subject: one folder per subject its use
  cases work on, named in the plural (`application/boxes/`,
  `application/minis/`), holding those use cases and the projections,
  filters and sort orders they share. What spans several subjects stays at
  the top (`faction-names.ts`, `hoard-view.ts`). No folders by kind
  (`use-cases/`, `projections/`) and no folder per single use case.
- Projections, filters and sort orders are readonly types and pure
  functions, not services; use cases and screen state are the classes that
  hold state and use them.
- Features share data, pure functions and presentational components, never
  smart components. When several features need the same state and
  behavior, it is a use case in `application/`, and each feature wires its
  own components to it.
- `data/` holds only stores and fixed or temporary data, e.g. sample data
  named `sample-<subject>.ts` that stands in for the server until its
  adapter exists.
- A store, named `<resource>-store.ts` (`BoxesStore`), keeps one resource
  as the server has it, in memory or browser storage: it loads it through
  its HTTP adapter, takes in what the server answers to changes (`apply`,
  `remove`, `reload`) and offers it as signals. It holds no search,
  filters, selection or projections.
- A store never uses another store. Code that combines stores, or writes to
  the server and then updates stores, is a use case in `application/` or in
  a feature.
- `models/` holds the types, value objects and business rules of the domain
  that only the client needs: what the domain is (e.g. `Box`, `Mini`,
  `Kit`) and the rules that follow from it, not how screens show it. It is
  the innermost layer: it imports nothing from Angular, RxJS or other
  frameworks and nothing from its own domain, only `@greyhoarder/domain`.
  Models are readonly types and pure functions, not classes or services;
  a rule that needs context (today's date, user settings) gets it as a
  parameter from the code in `application/` or the feature that calls it.
- When rules in `models/` or `libs/domain` keep needing context that
  dependency injection would provide, or the same context is passed
  through many rules, point it out and propose a new ADR that revisits
  this layer, instead of injecting into models or working around it.
- `infrastructure/` holds only access to external resources: one HTTP
  adapter per server controller, named `http-<resource>-adapter.ts`
  (`HttpSetupAdapter`). It maps between protocol DTOs and domain models
  (`models/` or `@greyhoarder/domain`); features never see DTOs.
- `util/` holds small helpers without business logic.
- Allowed: `features → ui`, `features → application`, `features → data`,
  `features → infrastructure`, `application → data`,
  `application → infrastructure`, `data → infrastructure`; every folder may
  use `models/` and `@greyhoarder/domain`, and every folder except
  `models/` may use `util/`.
- `ui` never uses `application`, `data` or `infrastructure`; `application`
  never imports `features` or `ui`; `data` never imports `application`,
  `features` or `ui`; features never import each other.
- Business rules belong in `models/`, or in `libs/domain` by the criterion
  under "Shared domain models" in architecture-boundaries.md; never in
  components, `application/`, stores or `infrastructure/`.
- No ports on the client.

_(derived from [ADR-0014](adr/0014-layers-within-a-domain.md))_

## App level on the client

- Besides `shared/` (see "Shared code" in architecture-boundaries.md), code
  outside `domains/` is the app level: `app.ts`, `app.config.ts`,
  `app.routes.ts` and `shell/`.
- The app level assembles domains and uses them only through their
  `api/` and, to load their routes lazily, their `<domain>.routes.ts`. It
  holds no business logic and no HTTP adapters.
- `shell/app-shell.ts` is the layout route above every route behind the
  login; login and setup stay outside it. Its navigation entries are a
  fixed list in the shell.

_(derived from [ADR-0004](adr/0004-domain-slicing.md),
[ADR-0014](adr/0014-layers-within-a-domain.md))_
