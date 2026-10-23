# ADR-0020: Community kit catalog

- **Status:** Proposed
- **Date:** 2026-10-22

## Context

Under ADR-0019, users create kits themselves. Typing what is in a box is
the slowest part of adding it, and every household types the same Boyz
box again. ADR-0005 already expects product data to be versioned
reference data that users do not create.

That data now has a home: the repository `greyhoarder/catalog`.

- It holds one YAML file per kit. The armies of each game system are in
  `factions/`.
- The data is under CC0, while Greyhoarder is under AGPL.
- Contributors add kits by pull request without touching the app.
- The catalog changes more often than the app.
- Released kit files are never renamed, moved or deleted, so kit ids stay
  stable.
- Kits still change after release: drafts are corrected and new releases
  are added.

Instances run on the user's own hardware, often only on the home network.
So far an instance needs no outside service to run.

## Decision

- **The catalog is product reference data.** Catalog kits and factions
  are reference data in the sense of ADR-0005. They are the same for the
  whole instance and read-only for every user. They are maintained only in
  the catalog repository.
- **It ships with the release.** The catalog repository is a git
  submodule of the Greyhoarder repository, pinned to one commit. Its YAML
  files ship with the server as they are; there is no separate build
  step.
  - A new catalog version reaches instances with the next Greyhoarder
    release. Instances never download it themselves.
- **It is imported on startup.** On every start, the server reads the
  catalog's files into one snapshot and checks them against the format
  this release of Greyhoarder knows. When the snapshot differs from the
  one it imported last, the server imports it.
  - A file or an entry that does not match the format, or refers to
    something not in the snapshot, is left out with a warning in the log;
    the server still starts. A left-out entry keeps its last imported
    version instead of being marked as removed.
  - The import is idempotent.
  - A kit whose content changed gets a new version, and the old one stays.
  - Unchanged kits are left as they are.
  - A kit that is missing from the snapshot is marked as removed, never
    deleted.
  - Factions are imported the same way.
- **It has its own domain.** The new domain `catalog` owns the imported
  kits and factions.
  - It answers queries for them: by army (including armies that are
    `partOf` another), by name and by barcode.
  - It has no endpoints that write.
- **Boxes copy; minis stay on their own.** A box from a catalog kit is
  added like a box from a user's kit (ADR-0019): its minis are created
  from the chosen variant and carry their own data. The box records the id
  and the version of the kit it came from. A new catalog version never
  changes existing boxes or minis.
- **User kits stay.** Users still create kits for what the catalog lacks.
  These kits stay in the hoard and belong to the user (ADR-0019).
- **Drafts are shown as drafts.** Catalog kits marked as draft are
  imported. The interface marks them as not checked against a box.

### Alternatives considered

- **Kits inside the Greyhoarder repository**: code and data would change
  in one pull request. But AGPL code and CC0 data would share a
  repository, contributors would have to clone the whole app, and data
  reviews would mix with code reviews.
- **Download at runtime from catalog releases**: new kits would arrive
  without a Greyhoarder release. But every instance would contact GitHub,
  would have to handle catalog formats newer than its own code, and would
  have no catalog without internet access. This can still be added later
  on top of the shipped catalog.
- **The catalog as an npm package**: it would be versioned like any other
  dependency, but a data repository would need a publishing pipeline and
  a registry account. A submodule pins a commit without either.
- **Turning the files into a snapshot during the build**: the server
  would need no YAML parser, and a broken catalog would fail the build
  instead of showing up at startup. But it adds a build step besides the
  server's own that every way of building and starting the server has to
  run.
- **Refusing to start on a broken catalog**: no broken entry could ever
  reach the database. But one wrong kit file would take down every
  instance of a release, and the household could not use the app at all
  until the next release.
- **Reading the snapshot at runtime, without a database**: no import would
  be needed. But every query would scan the whole snapshot, and a box could
  not refer to a kit version that has changed since.
- **Copying catalog kits into every user's kits**: this fits ADR-0019's
  ownership as it is. But the catalog would be duplicated per user, and
  corrections would either have to change user data or never arrive.
- **Updating catalog kits in place**: the import would be simpler. But it
  goes against ADR-0005, and a box could no longer show the kit as it was
  when the box was added.

## Consequences

- **Updating the catalog:**
  - Moving the submodule to a newer commit is an ordinary commit, and a
    bot can propose it.
  - Catalog changes reach users only through Greyhoarder releases.
- **Starting:**
  - A catalog commit that does not match the format Greyhoarder knows
    still starts; the entries that don't match are missing, and only the
    log's warnings show it. A format change in the catalog therefore needs
    a matching change in Greyhoarder before that commit can be pinned,
    and the warnings must be checked when the submodule moves.
  - The server needs the submodule's files at runtime: locally, in CI, in
    the dev container and in the server image.
  - The server reads and checks every file on each start, and needs a YAML
    parser as a runtime dependency.
- **Domains:**
  - `catalog` depends on no other domain.
  - `hoard` reads from `catalog` and may no longer be free of
    dependencies.
- **Data:**
  - Old kit versions stay in the database. With a few thousand kits and
    occasional corrections, this does not matter.
  - Ranges in the catalog repository are working lists for contributors
    and are not part of the snapshot.
- **The catalog repository's README:** its section on releases, which
  says that instances check for new releases themselves, no longer
  applies.
