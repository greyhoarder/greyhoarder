# Architecture: releases

Rules for the versions of Greyhoarder's releases, the commits they are
derived from and how a release is made. How images and apps are built and
published is not covered yet. How an instance updates its
database between versions is covered in
[ADR-0022](adr/0022-self-updating-instances.md) and
[ADR-0023](adr/0023-startup-sequence-and-migrations.md).

## Versions

- Releases are versioned with Semantic Versioning 2.0.0:
  `MAJOR.MINOR.PATCH`.
- The product has one version: the server, the web app, the packaged apps,
  the image and the git tag `v<version>` of a release carry the same
  version.
- The workspaces in `libs/` and `tests/` have no version of their own.
- The catalog submodule (`libs/catalog`) is versioned in its own
  repository; its version is not part of Greyhoarder's.
- Versions are `0.y.z` until the first public release. `1.0.0` is the first
  release that promises the update guarantees of ADR-0022.

_(derived from [ADR-0025](adr/0025-semantic-versioning-of-releases.md))_

## What goes up

- **Major**, when users or other releases have to adapt:
  - the release no longer updates databases of the major version before
    the previous one;
  - the configuration of an instance has to change: environment
    variables, the Compose file or volumes;
  - a feature is removed, or changed in a way users have to adapt to;
  - the HTTP API breaks for apps of the previous version: an endpoint or a
    field is removed or renamed, a field changes its type or meaning, or a
    request field becomes required.
- **Minor**, for features, endpoints or fields added without breaking
  anything of the above.
- **Patch**, for fixes that add nothing, and for a release that only moves
  the catalog to a newer commit.
- Migrations that run by themselves on startup make no release a major
  version.
- Before `1.0.0`, what would be a major version makes a minor version, and
  everything else a patch version.

_(derived from [ADR-0025](adr/0025-semantic-versioning-of-releases.md))_

## HTTP API between versions

- Apps and servers of the same major version work together, whatever their
  minor and patch versions.
- Within a major version the API only grows: new endpoints, new optional
  request fields, new response fields.
- Apps ignore response fields they don't know, and cope with a server of an
  older minor version that lacks an endpoint or a field.

_(derived from [ADR-0025](adr/0025-semantic-versioning-of-releases.md))_

## Commits and versions

- The next version follows from the commits since the last release:
  - `fix` makes a patch version;
  - `feat` makes a minor version;
  - a commit marked as breaking makes a major version;
  - `refactor`, `test`, `docs` and `chore` make no release on their own.
- Every commit that makes a major version by the rules above is marked
  with `!` after its type and scope, e.g. `feat(protocol)!: drop the tags of
  boxes`. Commit messages have a subject line only, so there is no
  `BREAKING CHANGE` footer.
- A commit that only moves the catalog submodule is a
  `chore(catalog): …` and makes a patch version.

_(derived from [ADR-0025](adr/0025-semantic-versioning-of-releases.md))_

## Making a release

- Releases are made locally on `main` with `npm run release`
  (release-it). It runs lint, tests and build of every workspace, derives
  the version from the commits, writes it into the root `package.json` and
  those of `apps/client` and `apps/server`, adds the release to
  `CHANGELOG.md`, commits `chore(release): v<version>`, and creates and
  pushes the tag `v<version>`.
- Never change the version or `CHANGELOG.md` by hand.
- The rules above are configured in `.release-it.json`; change it together
  with this guide.
- Two versions are set by hand: the first release with
  `npm run release -- 0.1.0`, and the first public release with
  `npm run release -- 1.0.0`, which also removes `preMajor` from
  `.release-it.json`.

_(derived from [ADR-0026](adr/0026-local-releases-with-release-it.md))_
