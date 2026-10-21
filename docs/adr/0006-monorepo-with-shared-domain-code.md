# ADR-0006: Monorepo with shared domain models

- **Status:** Accepted
- **Date:** 2026-10-21

## Context

The client is written in Angular (see ADR-0002) and the server in NestJS
(see ADR-0003). Both use TypeScript and are sliced into the same domains
(see ADR-0004).

Both sides work with the same concepts: a box, a model, its hobby status, etc.
Several rules and models are needed on both sides as well, for example which 
hobby status transitions are valid or how painted points are summed up. If each
side defines these types and rules on its own, they drift apart: a field is
renamed on one side only, or a bug is fixed in one place but not the other.

The server persists data with Mongoose (see ADR-0005). Mongoose schemas,
ObjectIds and documents are persistence details that the client must not
depend on.

Client and server are developed together, usually by the same person and
often in the same change.

## Decision

Client, server and shared code live in one repository, managed with npm
workspaces:

```text
greyhoarder/
├── apps/
│   ├── client/          ← Angular app
│   └── server/          ← NestJS app
└── libs/
    └── domain/          ← @greyhoarder/domain
        └── <domain>/    ← same domains as the apps
```

`libs/domain` holds the **shared domain models**: the types, value objects
and business rules that both apps need.

- It is plain TypeScript with no dependency on Angular, NestJS, Mongoose,
  RxJS or any other framework.
- It is divided into the same domains as the apps. Each domain has one
  entry point, `<domain>/index.ts`, published as
  `@greyhoarder/domain/<domain>` through the package's `exports`. One
  domain imports another only through that entry point. Unlike the apps,
  there is no `api/` folder: the `exports` map already keeps everything
  else internal, and the library holds no facades.
- Apps import it by package name, per domain:
  `@greyhoarder/domain/<domain>`, never by relative path.
- IDs are plain strings in shared models. Converting to and from ObjectId
  happens in the server's persistence code.
- Mongoose schemas live in the server and are written against the shared
  types; they are not part of `libs/domain`.
- How API contracts between client and server (request and response
  shapes) are defined is decided separately.

### Alternatives considered

- **Separate repositories for client and server**: clearer ownership, but
  shared code would need a published package and versioning for every
  change; too much overhead for one developer.
- **Nx workspace**: build caching and affected-only builds, but more
  tooling than the project needs now. An npm-workspaces layout can be
  migrated to Nx later without moving code.
- **An `api/` folder per domain, as in the apps**: the same structure
  everywhere, but it repeats what the package's `exports` already enforce
  and adds a folder that holds nothing but one file.
- **Sharing Mongoose schemas or documents with the client**: no duplicate
  types at all, but ties the client to the database and leaks persistence
  details into the UI.
- **No shared code**: simplest setup, but duplicated types and rules drift
  apart.

## Consequences

- A domain type or rule is written and tested once and used by both sides.
- A change that spans client, server and shared code is one commit and one
  review, and the compiler shows every place that has to follow.
- The server maintains a mapping between shared models and Mongoose
  documents. This is extra code, but it keeps the database replaceable and
  out of the client.
- Keeping `libs/domain` framework-free requires discipline; it is enforced
  by lint rules rather than convention alone.
- One repository means one CI pipeline that builds and tests everything;
  build times grow with the project.
