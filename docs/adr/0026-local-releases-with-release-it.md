# ADR-0026: Local releases with release-it

- **Status:** Proposed
- **Date:** 2026-10-28

## Context

ADR-0025 decides that the version of a release follows from the
Conventional Commits since the last one, and leaves open which tool
derives it, where the version is kept and how a release is made.

Releases are made by hand, not by CI. Much of the work on Greyhoarder is
done with AI coding agents. Without a tool, every release would mean
reading the history since the last tag, classifying each commit, picking
the version, writing the changelog and changing several `package.json`
files: slow, costly in tokens, and decided anew each time. The rules for
that already exist in `docs/architecture-releases.md`; they should be
applied by a machine, not reinterpreted.

The rules include two that generic tools don't apply by default: before
`1.0.0` a breaking change makes only a minor version, and a commit that
moves the catalog submodule makes a patch version although it is a chore.

## Decision

- **release-it with its Conventional Changelog plugin.** One command,
  `npm run release`, run locally on `main`, makes a release.
- **It derives the version from the commits** with the Conventional
  Commits preset: features, fixes and catalog moves (`chore(catalog)`)
  count, a commit marked as breaking makes a major version, and the
  preset's pre-major mode applies the `0.y.z` rule until `1.0.0`. The
  rules live in `.release-it.json`.
- **It checks before it releases.** Lint, tests and build of every
  workspace run first; a failure stops the release.
- **It writes the release into the repository:** the version into the root
  `package.json` and those of the apps, the changelog into `CHANGELOG.md`,
  a release commit, and the tag `v<version>`, which it pushes.
- **It publishes nothing else.** No npm package, no GitHub release and no
  image; those are decided when they are needed.

### Alternatives considered

- **release-please**: opens a release pull request and applies the
  pre-major rule by itself, but it only runs as a GitHub Action, and
  releases are not made by CI. A catalog move would need the type `fix`.
- **semantic-release**: releases on every push in CI, starts at `1.0.0` by
  design, and has no `0.y.z` phase.
- **changesets**: built for packages released apart, with change files
  written by hand; Greyhoarder has one version derived from its commits.
- **commit-and-tag-version**: local and close to release-it, but the
  version rules can't be adjusted beyond the commit types, and it has no
  hooks to check before releasing.
- **No tool, an agent or a person follows the guide**: no dependency, but
  costly and not reproducible, which is what ADR-0025 wanted to avoid.

## Consequences

- A release is one command and needs a clean working tree on `main`.
- Two development dependencies are added to the root of the monorepo.
- The version is kept in the root `package.json` and in those of the
  apps, all equal; the libraries and test suites stay at `0.0.0`.
- The pre-major mode has to be switched off for `1.0.0`, which is set by
  hand as the first public release.
- A release can't be made while a test fails.
- If CI comes later, it can react to the tags, e.g. to build the image,
  without making releases itself.
