# AGENTS.md — greyhoarder

Greyhoarder is a self-hosted collection tracker for miniature wargamers. It
records which boxes you own, which models came out of them, and where each
model stands in the hobby pipeline: sprue → built → primed → painted → based.

The client is an Angular app that runs in the browser and is packaged for
desktop and mobile; the backend is a NestJS API. Both run as a Docker
Compose stack (server, MongoDB, Redis) on the user's own hardware, shared by
a household with local accounts.

**Current scope:** boxes, the models they contain, and per-model hobby status.
Army lists, painting recipes and rules data come later and must not shape the
core data model prematurely.

## Architecture

Binding architecture rules live in `docs/`, the reasoning behind them in
[docs/adr/](docs/adr/README.md). Before changing code, read the guides that match
your task, and only those:

- **Any change to app or library code** (domains, folders, imports, Nest modules): 
  [architecture-boundaries.md](docs/architecture-boundaries.md)
- **Writing or changing code**:
  [coding-guidelines.md](docs/coding-guidelines.md)
- **Schemas, queries, MongoDB**:
  [architecture-persistence.md](docs/architecture-persistence.md)
- **Accounts, login, sessions, guards, user-owned data, hosting**:
  [architecture-security.md](docs/architecture-security.md)
- **Angular code in the client**:
  [architecture-angular.md](docs/architecture-angular.md)
- **Components, templates, styling**:
  [architecture-ui.md](docs/architecture-ui.md)
- **Look and feel** (colors, typography, spacing, screen layout, UI text):
  [design-system.md](docs/design-system.md)
- **Building or changing a screen**: its spec in
  [docs/screens/](docs/screens/README.md), if there is one
- **Writing or changing tests**:
  [architecture-testing.md](docs/architecture-testing.md)

If a task conflicts with these rules, stop and ask. An architecture rule
changes only through a new ADR; the coding guidelines and the design system
change only with the user's agreement.

## Commands

Run from the repository root:

- `npm start`: client dev server
- `npm run build`: build all workspaces
- `npm test`: run all unit tests once
- `npm run lint`: lint all workspaces (ESLint in the client, oxlint in the
  server)
- `npm run check:specs`: list components without a spec file
- `npm run <script> -w @greyhoarder/client`: a single workspace's script

Never invent scripts; use only those defined in the `package.json` files.

## Workflow

- Before finishing a task, run lint, tests and build for every workspace you
  changed, and report failures instead of hiding them.
- Don't add, remove or upgrade dependencies without asking.
- Don't commit or push unless asked.
- Every component needs tests, but write, change or delete a test case only
  after the user has approved that case (`write-tests` skill). Report a
  failing test instead of changing it to pass.
- Don't create, edit or supersede ADRs unless explicitly asked.
- Don't change Markdown files (`AGENTS.md`, `README.md`, `docs/`, skills)
  without asking first, even when a code change makes them outdated;
  point out what is outdated instead.
- Never read, change or create secrets or `.env` files.

## Language

- Code, comments, docs, ADRs and commit messages are in English.
- Reply to the user in the language they write in.