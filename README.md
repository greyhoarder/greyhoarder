<p align="center">
  <img src="apps/client/public/logo.svg" alt="Greyhoarder logo" width="128" height="128">
</p>

<h1 align="center">Greyhoarder</h1>

<p align="center">
  <strong>A self-hosted collection tracker for miniature wargamers.</strong><br>
  Know which boxes you own, which minis came out of them, and how far each
  one has come: sprue → built → primed → painted → done.
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-AGPL--3.0-blue" alt="License: AGPL-3.0"></a>
  <img src="https://img.shields.io/badge/status-early%20development-orange" alt="Status: early development">
  <img src="https://img.shields.io/badge/Angular-DD0031?logo=angular&logoColor=white" alt="Angular">
  <img src="https://img.shields.io/badge/NestJS-E0234E?logo=nestjs&logoColor=white" alt="NestJS">
  <img src="https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white" alt="MongoDB">
</p>

<p align="center">
  <a href="#features">Features</a> ·
  <a href="#getting-started">Getting started</a> ·
  <a href="#documentation">Documentation</a> ·
  <a href="#contributing">Contributing</a>
</p>

> [!WARNING]
> **Greyhoarder is an agentic coded project.** Its code, tests and
> documentation are written by AI coding agents. A human maintainer decides
> what is built and how, through the architecture decisions and rules in
> [docs/](docs/) and [AGENTS.md](AGENTS.md), but not every line has been
> read by a human. Expect the kind of mistakes generated code makes, and
> keep backups of your data.

---

## Features

- **Your hoard, mini by mini.** Every miniature has its own name, factions,
  parts (glued or magnetised) and hobby status, also long after it left the
  box it came in.
- **Boxes from a community catalog.** Find a kit by name, product code or
  barcode, add the box, and its minis appear on the sprue, ready to be
  built.
- **Loose and custom minis.** Add minis bought loose or second hand, or put
  together your own kitbashes, conversions and 3D prints.
- **The whole hobby pipeline.** Build, prime and paint at your own pace, keep
  what you're working on on the workbench, and record minis you sold, gave
  away or stripped for parts.
- **For the whole household.** Local accounts on one instance; everyone sees
  only their own hoard.
- **Self-hosted.** Runs with Docker on your own hardware; your collection
  stays yours.

> [!NOTE]
> Greyhoarder is in early development and has no release yet. The data
> model may still change, and updates between versions are only promised
> from 1.0.0 on.

## Getting started

The easiest way to work on Greyhoarder is the dev container: it brings
Node.js, MongoDB and Redis and sets everything up.

1. Clone the repository with its catalog submodule:

   ```sh
   git clone --recurse-submodules https://github.com/greyhoarder/greyhoarder.git
   ```

2. Open it in VS Code and choose **Reopen in Container**.
3. Start the server and the client in two terminals:

   ```sh
   npm run start:server
   npm start
   ```

4. Open <http://localhost:4200> and create the first account.

Without the dev container you need Node.js 24, MongoDB 8 running as a
replica set and Redis 8; then run `git submodule update --init` and
`npm ci`.

| Command         | What it does                     |
| --------------- | -------------------------------- |
| `npm test`      | Runs all unit tests once         |
| `npm run lint`  | Lints all workspaces             |
| `npm run build` | Builds all workspaces            |
| `npm run e2e`   | Runs the browser end-to-end tests |

## Documentation

- [docs/](docs/): the architecture guides, coding guidelines and design
  system
- [docs/adr/](docs/adr/README.md): the architecture decisions and why they
  were made
- [docs/domains/](docs/domains/README.md) and
  [docs/screens/](docs/screens/README.md): what each domain and screen does
- [AGENTS.md](AGENTS.md): how AI coding agents work in this repository

## Contributing

Missing a kit? The catalog lives in its own repository,
[greyhoarder/catalog](https://github.com/greyhoarder/catalog), and takes
pull requests for new and corrected kits.

## License

Greyhoarder is free software under the
[GNU Affero General Public License v3.0](LICENSE).
