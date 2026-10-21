# AGENTS.md — greyhoarder

Greyhoarder is a self-hosted collection tracker for miniature wargamers. It
records which boxes you own, which models came out of them, and where each
model stands in the hobby pipeline: sprue → built → primed → painted → based.

The client is an Angular app that runs in the browser and is packaged for
desktop and mobile; the backend is a NestJS API meant to run in a single
Docker container on the user's own hardware.

**Current scope:** boxes, the models they contain, and per-model hobby status.
Army lists, painting recipes and rules data come later and must not shape the
core data model prematurely.

## Architecture

Binding architecture rules live in `docs/`, the reasoning behind them in
[docs/adr/](docs/adr/README.md). Before changing code, read the guides that match
your task, and only those:

- **Any change to app or library code** (domains, folders, imports, Nest modules): 
  [architecture-boundaries.md](docs/architecture-boundaries.md)
- **Schemas, queries, MongoDB**:
  [architecture-persistence.md](docs/architecture-persistence.md)
- **Accounts, login, sessions, guards, user-owned data, hosting**:
  [architecture-security.md](docs/architecture-security.md)
- **Components, templates, styling**:
  [architecture-ui.md](docs/architecture-ui.md)

If a task conflicts with these rules, stop and ask. A rule changes only
through a new ADR.

## Commands

_Added once the workspace is scaffolded._ Until then there is nothing to build,
lint or test. Never invent scripts; use only those defined in `package.json`,
per workspace with `-w <workspace>`.

## Workflow

- Before finishing a task, run lint, tests and build for every workspace you
  changed, and report failures instead of hiding them.
- Don't add, remove or upgrade dependencies without asking.
- Don't commit or push unless asked.
- Never read, change or create secrets or `.env` files.

## Language

- Code, comments, docs, ADRs and commit messages are in English.
- Reply to the user in the language they write in.