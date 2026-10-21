# ADR-0002: Angular as client framework

- **Status:** Accepted
- **Date:** 2026-10-21

## Context

Greyhoarder needs one client that runs in the browser and can later be
packaged for desktop and mobile. Much of the code will be written with AI
agents, which benefit from a framework with strong conventions and
official tooling.

## Decision

The client is an Angular application, kept on the current major version
and written in modern Angular only:

- standalone components, no NgModules
- signals for state, `resource`/`httpResource` for async data
- `inject()` instead of constructor injection
- native control flow (`@if`, `@for`, `@switch`)
- zoneless change detection

Packaging for desktop and mobile is a separate decision (future ADR).

### Alternatives considered

- **React / Next.js**: largest ecosystem, but few conventions; structure
  would have to be invented and enforced by hand.
- **Vue / Nuxt, Svelte**: lighter, but less familiar and less official
  tooling for agents.
- **Flutter**: strong native story, but a second language and no shared
  code with the backend.

## Consequences

- Strong conventions and the Angular CLI (including its MCP server) give
  agents reliable, current guidance.
- TypeScript end to end allows sharing types with the backend (ADR-0003).
- Angular's six-month release cycle requires regular upgrades; we stay
  close to the latest major to keep them small.
- Older Angular patterns found online or in model training data must
  actively be avoided.
