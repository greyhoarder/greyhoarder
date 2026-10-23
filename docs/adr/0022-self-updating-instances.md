# ADR-0022: Self-updating instances

- **Status:** Proposed
- **Date:** 2026-10-23

## Context

Greyhoarder runs on the user's own hardware (ADR-0008). Updating means
pulling a newer server image and restarting it. Nobody on the instance is
expected to run migration scripts, read release notes before updating or
know what MongoDB is.

The data of an instance will change shape between releases: user data in
the hoard as the model grows (ADR-0019), and the catalog that ships with
each release and is imported on startup (ADR-0020). MongoDB has no schema
migrations of its own, and ADR-0005 only covers reference data, which is
versioned instead of migrated.

The hoard is the user's collection, often years of entries. An update that
fails half way must not lose or corrupt it, and must leave the instance
in a state that the previous release can still run.

## Decision

- **The server updates its own database.** When a newer release starts on
  an older database, it brings the database up to date by itself, without
  a separate command or manual step.
- **The database records its version.** The database stores the data
  version it was last brought to. A release knows the data version it
  needs.
- **Adjacent major versions are supported.** A release updates databases
  of its own major version and of the previous major version. A database
  older than that, or newer than the release, stops the start with a
  message that names the release to update through, or to go back to.
- **Startup is a fixed sequence.** Before the server answers any request,
  it runs these steps in order, and runs no request handling until they
  are done:
  1. make sure no other server process updates the same database;
  2. check the data version against the rules above;
  3. save the data needed to undo the update;
  4. run the migrations from the database's version to the release's;
  5. import the catalog (ADR-0020);
  6. record the new data version.
- **A failed update is rolled back.** If a step fails, the server restores
  the saved data, stops with a clear error and leaves the database as the
  previous release left it, so that release can be started again.
- **Migrations only go forward.** There are no down migrations; going back
  means restoring the saved data.
- **How it is built is decided later.** How data is saved and restored,
  where it is kept and for how long, how the lock works, how migrations
  are written and tested, and what happens to sessions in Redis are the
  subject of a later ADR.

### Alternatives considered

- **A migration command the user runs**: simple to build, but most users
  would not know they have to, and an instance started without it would
  run on data it does not understand.
- **Tolerant reading, no migrations** (each release reads every older
  shape): no update step at all, but every old shape has to be supported
  forever, and indexes and references cannot change.
- **Updates across any number of versions**: convenient for instances
  that are rarely updated, but every migration would have to be kept and
  tested forever. Stepping through each major version keeps that bounded.
- **Down migrations**: would allow going back without saved data, but
  every migration would need a tested reverse, and some changes (dropping
  data) have none.
- **Relying on MongoDB transactions alone**: atomic, but large migrations
  exceed what one transaction can hold, and index changes are not part of
  a transaction.

## Consequences

- An update is pulling a new image and restarting it; the first start
  after an update takes longer.
- Skipping a major version needs an intermediate release; the server says
  which one.
- Saving data before an update needs disk space for a copy of what the
  update touches.
- Every change to stored data in a release comes with a migration, and the
  data version goes up.
- The catalog import becomes a step of the startup sequence instead of a
  startup hook of its own.
- The details depend on a later ADR; until it exists, there are no
  migrations to run and the sequence consists of the catalog import.
