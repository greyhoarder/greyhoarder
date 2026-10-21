# ADR-0004: Slice client and server by domain

- **Status:** Accepted
- **Date:** 2026-10-21

## Context

Greyhoarder will grow from collection tracking into product data, rules
data, army lists, painting recipes and more. These areas change for
different reasons and at different speeds: products (boxes, kits) are
re-released over time, rules change with every edition and points update,
and a user's collection is stable. The link between a physical model and
the rules that apply to it changes whenever the rules do.

Slicing by technical type (`components/`, `services/`, `schemas/`) would
scatter each area across the codebase and let any file depend on any
other. Over time that produces hidden coupling that neither humans nor
agents can see from a single file.

The client is written in Angular (see ADR-0002) and the server in NestJS
(see ADR-0003). Both are often changed together.

## Decision

Both apps are divided into the same **domains**. Each domain owns one area
of the business, its code on both sides, and its persisted data.

### Location

```text
apps/client/src/app/domains/<domain>/
apps/server/src/domains/<domain>/
```

A domain has the same name in both apps.

### Public API

Each domain exposes a public API in `<domain>/api/index.ts`. Other domains
may import only from there; everything else inside a domain is internal.

`api/` is the contract between domains and nothing else:

- It contains re-exports and, where needed, narrow types or facades made
  for other domains (e.g. a summary type instead of an internal record).
- It contains no controllers, gateways or other entry points for external
  clients. Those belong to the code that implements the use case.
- Code inside a domain never imports from its own `api/`.

### Shared code

Code that is cross-cutting and free of business logic lives in
`apps/client/src/app/shared/` and `apps/server/src/shared/`. Shared code
never imports from a domain. Code moves into `shared/` only when at least
two domains need it, and only with the user's agreement.

### Server specifics

- Each domain is one Nest module, e.g. `UsersModule`. A module's
  `exports` contain only what its `api/` publishes.
- Each domain owns its persisted data. Other domains read that data only
  through the owning domain's `api/`, never by accessing its storage
  directly.
- Domain modules never use `forwardRef()` on each other. When a domain
  needs to react to something that happens in a domain it may not depend
  on, it listens to an event instead.

### Alternatives considered

- **Technical slicing** (`components/`, `services/` …): simple at first, but
  provides no boundaries.
- **One Nx library per domain**: stronger isolation and build caching, but
  more tooling than needed now. The folder-per-domain structure maps
  one-to-one onto libraries, so this remains an option.
- **A single `index.ts` at the domain root instead of an `api/` folder**:
  one folder less, but turns the whole domain into one Sheriff module,
  needs special rules, leaves no place for facades and invites
  `export *`.
- **Controllers and gateways in the server's `api/`**: one place for all
  entry points, but splits each use case across two folders and lets
  other domains see transport code.

## Consequences

- Each domain can be understood, changed and tested on its own, on both
  sides of the wire.
- The same names and rules apply in client and server, so moving between
  them needs no translation.
- Cross-domain dependencies are explicit, visible in `api/index.ts` and
  checked by lint.
- Reading another domain's data through its API instead of directly costs
  an extra call; at the expected data volume this is irrelevant.
- Deciding which domain owns a concept takes effort. Border cases are
  resolved by publishing a narrow type or function through the owning
  domain's `api/`, not by sharing internals.
