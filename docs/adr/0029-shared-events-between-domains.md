# ADR-0029: Events between domains live in shared code

- **Status:** Proposed
- **Date:** 2026-11-01
- **Amends:** [ADR-0016](0016-in-process-events-between-domains.md)

## Context

ADR-0016 defines an event in the domain that publishes it and re-exports it
through that domain's `api/`. Events exist so that a domain can react to
another one it may not depend on, and that is exactly when it can't import
from the publisher's `api/`: `hoard` depends only on `catalog`, Sheriff
enforces this, and yet `hoard` has to hear `UserDeleting` from `users`.

An event another domain hears is a contract between two domains and belongs
to neither alone.

## Decision

- **Events that another domain hears live in
  `apps/server/src/shared/events/`.**
- **Only events within one domain stay in that domain.**

The rule of ADR-0016 on where events are defined is replaced by this one;
the rest of ADR-0016 stands.

### Alternatives considered

- **Allow listeners to import from the publisher's `api/`:** every listener
  would add a dependency against the direction of the domains, which is
  what events are there to avoid.
- **Move an event to shared code only when a domain without a dependency on
  the publisher hears it:** the place would depend on who happens to
  listen, and adding a listener could mean moving the event.

## Consequences

- There is one rule without an exception, and Sheriff needs no special case.
- The place of an event says who may hear it.
- `shared/` knows the names of domain concepts such as a user being
  deleted, though only as small classes without behavior.
