# Greyhoarder

A self-hosted collection tracker for miniature wargamers. Greyhoarder records
which boxes you own, which models came out of them, and where each model
stands in the hobby pipeline: sprue → built → primed → painted → based.

> **Status:** early design phase. The architecture is documented; there is no
> runnable code yet.

## Stack

- **Client:** Angular, Spartan UI, Tailwind CSS. It runs in the browser and is
  packaged for desktop and mobile later.
- **Server:** NestJS with MongoDB and Redis, run with Docker on your own hardware.
- **Repository:** npm workspaces monorepo (`apps/client`, `apps/server`,
  `libs/domain`).

## Getting started

Setup and run instructions follow once the workspace is scaffolded.

## License

[GNU Affero General Public License v3.0](LICENSE)
