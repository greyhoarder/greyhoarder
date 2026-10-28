# ADR-0025: Semantic versioning of releases

- **Status:** Proposed
- **Date:** 2026-10-28

## Context

Greyhoarder ships as releases: a server image that serves the web app
(ADR-0017), and the client packaged for desktop and mobile. Instances are
updated by pulling a newer image (ADR-0022), while the packaged apps are
updated on their own schedule, so an app may talk to a server of another
release.

ADR-0022 already relies on major versions: a release updates databases of
its own and of the previous major version. ADR-0023 tags each migration
step with the release that introduced it. Neither says what a version is
or when which part of it goes up. All workspaces are still at `0.0.0`, and
there are no releases yet.

The catalog is a repository of its own, changes more often than the app
and is pinned by each release to one of its commits (ADR-0020).

Commits already follow Conventional Commits, so every commit says whether
it fixes something, adds something or only changes the inside.

## Decision

- **Semantic Versioning 2.0.0.** Every release has a version
  `MAJOR.MINOR.PATCH`.
- **One version for the product.** The server, the web app, the packaged
  apps, the image and the git tag of a release carry the same version. The
  libraries and test suites of the monorepo are private and have no
  version of their own.
- **The catalog keeps its own version.** It is versioned in its own
  repository. A release records which catalog it ships, but the catalog's
  version is not part of Greyhoarder's. A release that only moves the
  catalog to a newer commit is a patch release.
- **A major version is what users or other releases have to adapt to.** A
  release is a new major version when:
  - updating to it is more than pulling the image and restarting it: it no
    longer updates databases of the major version before the previous one
    (ADR-0022), or the configuration of an instance (environment
    variables, Compose file, volumes) has to change;
  - it removes a feature or changes one in a way users have to adapt to;
  - it breaks the HTTP API for apps of the previous version, since the
    packaged apps are updated apart from their server.
- **Minor and patch versions are safe to take.** A minor version adds
  features, endpoints or fields without breaking anything above. A patch
  version fixes without adding. Migrations that run by themselves on
  startup (ADR-0022) make no release a major version.
- **Apps and servers of the same major version work together,** whatever
  their minor and patch versions.
- **The version follows from the commits.** A fix makes a patch version, a
  feature a minor version, and a commit marked as breaking a major
  version; refactorings, tests, docs and chores make no release on their
  own. A tool derives the version, the tag and the changelog from the
  commits since the last release. Which tool is decided when releases are
  set up, since it adds a dependency.
- **`0.y.z` until the first public release.** As Semantic Versioning
  allows, a minor version may break anything until then, and the update
  guarantees of ADR-0022 do not apply yet. `1.0.0` is the first release
  that promises them.

### Alternatives considered

- **A version per workspace**: client, server and libraries could be
  released apart. But they are built, tested and shipped together;
  separate versions would need a table of which fit together, and the
  major version of ADR-0022 would have no single meaning.
- **Calendar versions** (`2026.10`): tell when a release came out, but not
  whether updating to it is safe, which is what ADR-0022 needs a version
  for.
- **Only the stored data makes a major version**: simpler, but a packaged
  app of an older release would break against a newer server without
  warning, and a changed configuration would surprise whoever updates.
- **Setting versions by hand**: needs no tool, but a breaking change is
  easily missed; the commits already carry what the version needs.
- **Starting at `1.0.0`**: would promise updates across releases while the
  data model is still expected to change (ADR-0019).
- **One version including the catalog**: the catalog is versioned by its
  contributors and changes more often than the app; every catalog commit
  would become a Greyhoarder version.

## Consequences

- A breaking change has to be marked in its commit. The commit messages
  have a subject line only, so the mark goes into it (`feat(protocol)!:`),
  not into a footer.
- Changes to the HTTP API are checked for compatibility; removing or
  renaming an endpoint or a field waits for a major version, and an app
  has to cope with a server of an older minor version.
- Breaking changes to the configuration, the API and dropping old update
  paths are collected into major versions instead of being spread over
  releases.
- The data version of ADR-0022 and the `version` of migration steps in
  ADR-0023 are versions of this scheme.
- Updating the catalog needs a release; a catalog that changes often means
  frequent patch releases.
- Where the version is kept, how it gets into the image and the apps,
  which tool derives it and how releases are published are decided when
  releases are set up.
- Until `1.0.0`, instances may have to start over after an update.
