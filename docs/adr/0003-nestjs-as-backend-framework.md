# ADR-0003: NestJS as backend framework

- **Status:** Accepted
- **Date:** 2026-10-21

## Context

Greyhoarder is self-hosted: one backend instance per user or household,
running in a single container on the user's own hardware. The backend
serves a REST API to the Angular client and imports catalog data.

The client is written in TypeScript (ADR-0002). Using the same language on
the server lets both sides share domain types and logic, and keeps the
project in one toolchain.

## Decision

The backend is a NestJS application in TypeScript.

### Alternatives considered

- **Plain Express or Fastify**: less overhead, but no structure; modules,
  DI and validation would have to be built by hand.
- **ASP.NET Core**: mature and fast, but a second language and no shared
  types with the client.
- **Python (FastAPI)**: good for data import, but same drawback as above.

## Consequences

- Nest's modules and dependency injection feel familiar coming from
  Angular, which lowers the cost of switching between client and server.
- Domain models can be shared between client and server.
- Nest adds decorators and some boilerplate compared to a minimal server.
- Startup time and memory are higher than a minimal server; irrelevant at
  the expected load.