# ADR-0015: API protocol with shared Zod schemas

- **Status:** Proposed
- **Date:** 2026-10-21

## Context

Client and server share domain models in `libs/domain` (see ADR-0006),
which left open how request and response shapes are defined. Controllers
on the server and HTTP services on the client map between these shapes and
the domain models (see ADR-0014).

Request and response shapes are not the domain models: they add
pagination, partial views and input forms, and they change for transport
reasons. The server must check them at runtime, because the client cannot
be trusted, and responses must never leak persistence details or fields
such as password hashes.

## Decision

- Request and response shapes of the REST API are **Zod schemas** in a new
  library, `libs/protocol` (`@greyhoarder/protocol`).
- It is divided into the same domains as the apps. Each
  `libs/protocol/<domain>/` exposes its schemas in `api/index.ts`,
  published as `@greyhoarder/protocol/<domain>` through the package's
  `exports`, like `libs/domain`.
- `libs/protocol` may depend on `zod` and `@greyhoarder/domain`, and on
  nothing else. This is the only exception to the framework-free rule of
  ADR-0006; `libs/domain` stays free of dependencies.
- For every shape there is a schema and a type inferred from it, e.g.
  `loginRequestSchema` and `type LoginRequest`.
- The server uses `nestjs-zod`: DTOs are created from the protocol
  schemas, a global validation pipe checks every request, and every
  response is serialized through its schema, so fields the schema does not
  declare are dropped.
- The client uses the inferred types in its HTTP services, built on
  Angular's `HttpClient`.
- Routes are not part of the protocol.

### Alternatives considered

- **Contract libraries with routes and generated clients** (ts-rest,
  oRPC): routes are type-checked too, but their clients are built on
  `fetch` instead of `HttpClient`, bypassing interceptors and Angular's
  resource APIs.
- **Nest DTOs with `class-validator`, OpenAPI and a generated Angular
  client**: the standard NestJS way, but needs a code generation step and
  gives the client types without validation.
- **Shared TypeScript interfaces only**: no dependency, but no runtime
  validation; the server would repeat every shape in a validator.
- **Protocol schemas inside `libs/domain`**: one library less, but mixes
  transport shapes with domain models and would put Zod into the domain.

## Consequences

- One schema defines the type, the request validation and the response
  filter.
- Changing a schema shows every affected place on both sides at compile
  time; a breaking change is one commit across client, server and
  protocol.
- Zod becomes a runtime dependency of both apps, and `nestjs-zod` of the
  server; both must keep up with Zod and NestJS majors.
- OpenAPI can be generated from the schemas if external clients need it.
- Routes are not checked by the compiler; HTTP services and controllers
  must agree on paths by convention and end-to-end tests.
