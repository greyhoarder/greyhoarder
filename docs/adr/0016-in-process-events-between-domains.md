# ADR-0016: In-process events between domains

- **Status:** Proposed
- **Date:** 2026-10-21

## Context

Dependencies between domains point in one direction only, and a domain
that must react to something in a domain it may not depend on listens to
an event instead (see ADR-0004). How events work was left open.

The first case is deleting an account: `users` must not know the domains
that store data per user, yet their data has to go when the account goes,
and the deletion must not finish while that data still exists. Other cases
are side effects that must not hold up the request that caused them, such
as telling other devices of the household about a change.

Greyhoarder is one server process for one household (see ADR-0008). It
needs no independent scaling or deployment of its parts, and the code
should stay readable from top to bottom for humans and agents.

## Decision

### When to use events

- Within a domain, code calls code directly.
- A domain asks another domain through that domain's `api/`, directly.
- Events are used only to **react across a domain boundary** against the
  direction of dependency, and for **side effects** that are not part of
  the use case itself.

### Two kinds of events

| | Synchronous | Asynchronous |
|---|---|---|
| Used when | the listeners are part of the use case; it is not done without them | the listeners cause side effects; the use case is done without them |
| Publisher | waits until every listener has finished | continues immediately |
| Listener error | aborts the use case; the publisher gets the error | is logged; the use case still succeeds |
| Name | present participle: `UserDeleting` | past tense: `BoxAdded` |
| Example | other domains erase a user's data | other devices are notified of a new box |

- Events run in the server process; there is no message broker.
- Both kinds go through one small service in `apps/server/src/shared/events/`,
  so the kind is visible where an event is published:
  `await events.dispatch(new UserDeleting(id))` for synchronous events,
  `events.notify(new BoxAdded(box))` for asynchronous ones. It wraps
  `@nestjs/event-emitter` and is the only place that configures it.
- Asynchronous events are not durable: an event is lost if the process
  stops before its listeners have run. They are used only for side effects
  whose loss is acceptable or can be repaired.

### Events and listeners

- An event is a class, never a string, so every listener can be found
  through its references.
- An event belongs to the domain that publishes it. It is defined where it
  is published and re-exported through that domain's `api/`.
- A listener is an entry point (see ADR-0014) and lives in a feature of the
  listening domain.
- Listeners are idempotent: handling the same event twice has the same
  result as handling it once.
- Destructive flows that use synchronous events first make the subject
  inactive, then dispatch the event, then remove the subject. If a listener
  fails, the flow stops and can be repeated.

### Alternatives considered

- **Events with an outbox from the start**: events survive a crash and
  listeners are retried, but it needs a stored outbox and a worker for a
  single process that does not need them. It remains the next step if
  asynchronous events must become reliable or the server is split.
- **An orchestrating layer above the domains** (`processes/`): every flow
  is readable in one file, as in classic monoliths, but each new domain
  must be added there by hand, and it is a new structure next to the
  domains.
- **A port in the publishing domain that other domains implement and
  register**: synchronous and explicit, but a second mechanism with the
  same purpose as synchronous events.
- **Fully event-driven backend, command bus or event sourcing**: decoupled
  and extensible, but request–response endpoints would need request–reply
  over events, flows could no longer be read top to bottom, and error
  handling would turn into saga design, without the benefits that only
  distributed systems get.
- **Asynchronous events only**: fully decoupled at runtime, but deleting an
  account could not wait for other domains, so data could outlive its
  owner.

## Consequences

- Domains stay decoupled in code; at runtime, synchronous events couple
  them as much as a direct call would. In a single process this is
  accepted.
- A flow across domains is spread over the publisher and its listeners.
  Typed events, the `dispatch`/`notify` names and the domain specs keep it
  traceable.
- `@nestjs/event-emitter` becomes a dependency of the server.
- Its listener defaults hide errors; the shared service has to make
  synchronous listener errors reach the publisher, and a test has to prove
  it.
- Making asynchronous events reliable later means adding an outbox to the
  shared service; publishers and listeners stay unchanged.
