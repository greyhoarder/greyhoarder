# ADR-0001: Record architecture decisions

- **Status:** Accepted
- **Date:** 2026-10-21

## Context

Greyhoarder is built with substantial help from AI coding agents. Agents
follow written rules well, but they cannot infer intent from code alone:
without a recorded reason, a rule looks arbitrary, and an agent will
"improve" it away the first time it gets in the way. The same applies to a
human returning to the project after months.

We need a place that explains *why* the architecture is the way it is, kept
separate from the rules themselves, so the rules can stay short.

## Decision

We record every architecturally significant decision as an Architecture
Decision Record (ADR) in `docs/adr/`.

- One decision per file, named `NNNN-kebab-case-title.md`, numbered
  sequentially and never renumbered.
- Each ADR has: Status, Date, Context, Decision (with Alternatives
  considered) and Consequences. ADRs contain no rule lists.
- Status is one of `Proposed`, `Accepted`, `Superseded by ADR-NNNN`,
  `Deprecated`.
- Accepted ADRs are not edited in substance. A changed decision gets a new
  ADR that supersedes the old one; the old one only gets its status updated.
- `docs/adr/README.md` lists all ADRs with number, title and status.

Binding rules live only in `docs/architecture-*.md` and other docs, never
in the ADR itself, so each rule exists exactly once. Each rule section there
links back to the ADR it is derived from:
`_(derived from [ADR-NNNN](adr/NNNN-title.md))_`.

## Consequences

- Rules stay short and enforceable; the reasoning lives one link away.
- Agents can answer "why" questions from `docs/adr/` instead of guessing.
- Changing a rule requires a new or superseding ADR first, which makes
  architecture changes deliberate and visible in review.
- Writing ADRs costs time. We accept this for decisions that shape
  structure, data or boundaries, not for local implementation choices.
