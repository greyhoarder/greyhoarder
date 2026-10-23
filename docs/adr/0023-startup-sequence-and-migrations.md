# ADR-0023: Startup sequence and migrations

- **Status:** Proposed
- **Date:** 2026-10-23

## Context

ADR-0022 decides that an instance updates its own database on startup,
between adjacent major versions, saves what it needs to undo a failed
update and rolls back when a step fails. It leaves open how this is built.
This ADR fills that in.

The forces:

- Each domain owns its persisted data (ADR-0004). Only the owning domain
  knows how its collections looked in an older release, so its migrations
  belong to it.
- Someone has to run the sequence: lock, version check, saving, steps in
  order, rollback. That is state of the instance as a whole, the purpose
  of the `instance` domain. If `instance` called each domain's steps
  itself, it would depend on every domain; if each domain called into
  `instance`, every domain would depend on it.
- A migration finds data in its old shape. The domain models in
  `libs/domain` and the Mongoose schemas describe the current shape only.
- The catalog import (ADR-0020) already runs on every start and is the
  first step the sequence has.
- MongoDB runs as a single-node replica set (ADR-0005), so transactions
  are available. A transaction lives at most 60 seconds, holds all its
  changes in memory and cannot contain index changes, renames or drops of
  existing collections.
- The data of an instance is small: thousands of documents per user, a
  few thousand catalog kits.

## Decision

### Steps and where they live

- **A startup step** is a provider that implements the interface
  `StartupStep`:
  - `domain`: the domain the step belongs to, e.g. `catalog`;
  - `version`: the release that introduced the step (semantic version);
  - `id`: unique within the domain, sortable, e.g. `0001-rename-box-tags`;
  - `runs`: `once` or `onEveryStart` (see below);
  - `run(context)`: does the work. The context holds the data version the
    database had before this start (none on a new database) and the
    version it is brought to, so a step can act on a change of major
    version.
- `StartupStep` and the decorator that marks a provider as a step live in
  `apps/server/src/shared/startup/`, without business logic and without
  any domain names. No domain depends on `instance`, and `instance`
  depends on no domain.
- **Each domain keeps its migrations** in
  `<domain>/infrastructure/migrations/`. This extends the rule
  "infrastructure holds only implementations of ports"
  (`docs/architecture-boundaries.md`): a migration implements no port,
  but like an adapter it works directly on storage.
- **Steps that use a feature are entry points.** A step that runs a use
  case of its domain lives in that feature as an entry point, like a
  controller or a listener, in the subfolder `startup-steps/`. The
  catalog's import is the step
  `catalog/features/import/startup-steps/`; it runs the import service
  and contains no logic of its own.
- **Files** of steps end in `.startup-step.ts`, in both places.
- **Migrations work on raw collections** with fixed collection and field
  names, through the MongoDB driver. They never use domain models or
  Mongoose schemas, because they find the data in its old shape and must
  keep working after those change.

### Running the steps

- The sequence lives in `instance/features/startup/`. It knows no domain
  models and no domain names; it gets the order of the domains from the
  composition root (below).
- It collects every provider marked as a startup step through
  `DiscoveryService` from `@nestjs/core` and starts in
  `onApplicationBootstrap`, so no request is answered before it is done.
- **Order:** by `version`, then by the dependency order of the domains
  (`users`, `auth`, `catalog`, `hoard`; a domain's steps run after those
  of the domains it depends on), then by `id`. The composition root
  (`app.module.ts` or `config/`) holds this order, matching the
  dependency rules in `docs/architecture-boundaries.md`, and passes it to
  `instance`. A step of a domain missing from the order stops the start.
- **Once or on every start:** a step with `runs: 'once'` runs once per
  database and is recorded as done. A step with `runs: 'onEveryStart'`,
  like the catalog import, runs on every start and therefore must be
  idempotent: running it again on its own result changes nothing. It
  must also be atomic on its own, because no copy is saved for it alone.
- **Sequence:**
  1. Take the startup lock: one document with a lease that expires, so a
     second server process waits, and a crashed one does not block
     forever.
  2. Read the instance state: the data version and the steps done.
  3. Check the version (ADR-0022): same or previous major version; a
     database from an older or a newer major stops the start.
  4. If any once-step is pending or the data version changes, check the
     free disk space and save the database (below).
  5. Run the pending once-steps and then the on-every-start steps in the
     order above, recording each once-step as done.
  6. Record the release's version as the data version and the state
     `ready`, release the lock.
- **On failure:** restore the saved database, record the state `failed`
  with the step and the error, log the error, release the lock and stop
  the start. The database is then as the previous release left it.
- **Instance state** is owned by `instance`: the data version, the state
  (`updating`, `ready`, `failed`), the last error and the steps done.

### Saving and rolling back

- **Rollback restores a saved copy** of the database; transactions alone
  are not the rollback.
- **Free space first.** Before saving, the sequence compares the size of
  the database's data and indexes (`dbStats`) with the free space of the
  MongoDB server's file system (`fsTotalSize` minus `fsUsedSize`). With
  less than twice that size free, it stops the start before any step and
  says how much space is missing.
- **How it is copied.** The server copies with the MongoDB driver it
  already uses, without `mongodump` and without new tools in the image:
  - the backup database is on the same MongoDB server and is named after
    the database with the suffix `-backup`; an older copy in it is
    dropped first;
  - every collection is copied inside MongoDB with an aggregation ending
    in `$out` to the backup database, so no document passes through the
    server;
  - the index definitions of every collection (`listIndexes`) are stored
    in the backup database as well, since `$out` does not copy them;
  - the copy is complete only once a marker document with the data
    version and the time is written last.
- **How it is restored.** Every collection of the database is dropped,
  including ones a migration created, and every saved collection is
  copied back with `$out` and gets its saved indexes again.
- **Restoring by hand.** The copy of the last update is kept until the
  next update replaces it. To go back to the previous release after a
  successful update, the user stops the server, restores the copy and
  only then starts the previous release:
  - the documentation describes this as a `mongosh` script, run inside
    the MongoDB container, that does the same as the automatic restore;
  - the restored instance state carries the old data version, so the
    previous release starts on it normally.
- **Not a backup.** The copy lives on the same server and disk as the
  data. It protects against a failed update, not against a lost disk, a
  broken server or a deleted volume. Users still need a real backup of
  their MongoDB volume; the documentation says so.
- **Within a step**, a transaction is used where it fits, as the catalog
  import does.
- **Sessions in Redis** are not saved. `instance` does not touch them: a
  step of `auth` with `runs: 'onEveryStart'` removes all sessions when
  its context shows a change of major version, and users sign in again.

### Alternatives considered

- **Rollback by transaction**: no copy, nothing to restore. But the whole
  sequence would have to fit into 60 seconds and memory, index changes
  and renames could not be part of it, and steps of several versions
  could not be undone together.
- **`mongodump` and `mongorestore`**: proven tools, but the server image
  would need the MongoDB database tools and run them as separate
  processes.
- **`instance` calls each domain's migrations**: simple to follow, but
  `instance` would depend on every domain.
- **Each domain registers its steps through `instance/api`**: explicit,
  but every domain would depend on `instance`.
- **A migration library** (e.g. `migrate-mongo`): ready-made bookkeeping,
  but a new dependency, its own file layout outside the domains and no
  rollback by restore.
- **Migrations through Mongoose schemas or domain models**: less code, but
  they break as soon as the models move on.
- **Starting in `main.ts` before `listen()`**: explicit, but outside
  Nest's lifecycle; `onApplicationBootstrap` also runs before `listen()`.

## Consequences

- `docs/architecture-boundaries.md` needs:
  - `apps/server/src/shared/startup/` as allowed shared code;
  - `infrastructure/migrations/` as an extension of "infrastructure holds
    only implementations of ports";
  - `startup-steps/` as a kind of entry point in features, with the
    suffix `.startup-step.ts`;
  - the domain order for startup steps in the composition root, next to
    the dependency rules.
- The catalog import's own `onApplicationBootstrap` hook goes away; the
  import becomes the step in `catalog/features/import/startup-steps/`.
- `auth` gets its first startup step, for the sessions.
- An update needs disk space for one copy of the database, and the first
  start after it takes longer by the time to copy it. A disk too full for
  the copy stops the update instead of risking it.
- The operations documentation needs the `mongosh` script for restoring
  by hand and the note that the copy is no backup.
- The end-to-end fixture has to drop the backup database of each worker
  as well.
- The server needs to know its own release version.
- How migrations are tested against data in an old shape is left to the
  decision on integration tests.
- While the sequence runs, the server does not listen; the reverse proxy
  answers with an error until it is done.
