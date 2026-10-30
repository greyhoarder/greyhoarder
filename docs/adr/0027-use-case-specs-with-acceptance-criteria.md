# ADR-0027: Use-case specs with acceptance criteria

- **Status:** Proposed
- **Date:** 2026-10-30

## Context

Greyhoarder is written by AI coding agents, checked by a human maintainer.
Lint rules, Sheriff and the architecture tests check how the code is built,
not whether it does what the user needs. What it should do is written down
per screen in `docs/screens/` and as rules in `docs/domains/`; no document
describes a use case as a whole: what the user wants to reach, across which
screens, and how success shows. Building minis from the sprue, for example,
is spread over three screen specs and a domain doc.

Tests an agent writes after implementing a change test its own reading of
it; tests generated against faulty code tend to assert the fault. Tests
derived from a short specification written and reviewed before the code
avoid that, and without a specification no check can tell a correct result
from a wrong one.

## Decision

- **Every use case has a spec in `docs/use-cases/`**, one file each: what
  the user wants to reach, which screens it runs over, what is out of
  scope, its requirements and their acceptance criteria. A use case is
  what a user does for one goal, e.g. adding minis from the catalog, not a
  screen or a component.
- **Specs are living documents.** They describe the current behavior and
  change in the same commit as the code and tests that change it; there
  are no change or delta files.
- **The format follows OpenSpec**: requirements in normative language
  (SHALL, MUST), each with scenarios in Given/When/Then. Each scenario is
  an acceptance criterion with a stable ID of its own, which is never
  changed, reused or renumbered, so tests can refer to it.
- **A spec is short**, about a screen page. It links to screen specs and
  domain rules instead of repeating them: the use case says what the user
  reaches and how success shows, the screen spec how the screen looks and
  which states it has, the domain doc which rules always hold. Open points
  are listed as open questions instead of being guessed.
- **A spec is required for new features and changed behavior.** Bug fixes
  with a test that reproduces the bug, refactorings and changes of look
  only need none.
- **The spec comes first.** An agent may draft it; the maintainer approves
  it before tests and code are written for it. Tests are derived from its
  acceptance criteria, then the code is written.
- **Existing use cases get a spec when they are next changed**, the most
  important ones first; there is no catch-up of all of them at once.
- **No spec-driven tool is used.** The format is applied by hand and by
  agents following the guide.
- How tests refer to the acceptance criteria and how a check matches them
  is decided in a later ADR, together with the test strategy that follows
  from it.

### Alternatives considered

- **OpenSpec with its CLI**: validates the format and merges change
  deltas into living specs, but identifies requirements only by their
  name, so tests can't refer to them reliably, and adds a workflow of its
  own beside the existing skills and approvals. Its deltas serve teams
  reviewing parallel proposals; Greyhoarder has one maintainer who commits
  on `main`, and its specs are already updated in place.
- **Spec Kit or Kiro**: a spec, plan and tasks per change; thorough, but
  many documents to review for each change, and specs tied to the change
  rather than kept as living documents.
- **Acceptance criteria in the screen specs**: no new kind of document,
  but coverage would again be counted per screen, and use cases spanning
  screens would still have no place.
- **Only tests, no specs**: no documents to keep up to date, but the tests
  would again be the agent's reading of the change, with nothing to check
  them against.

## Consequences

- Behavior gets a reviewable source of truth that tests can be checked
  against; reviewing a short spec replaces part of reviewing tests.
- Every feature starts with writing and approving a spec, which takes time
  before any code is written.
- Specs have to be kept up to date with the code; without a check, they
  can drift. The check comes with the later ADR on tests.
- Screen specs and use-case specs overlap until the behavior that belongs
  to a use case has moved out of the screen specs; this happens as each
  use case gets its spec.
- Agents load a use-case spec only for work on that use case, so it does
  not add to the context of every session.
- The rules for writing specs live in `docs/use-cases/README.md`.
