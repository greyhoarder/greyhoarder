# ADR-0024: Architecture tests with Sheriff and ArchUnitTS

- **Status:** Proposed
- **Date:** 2026-10-24

## Context

The architecture rules live in `docs/architecture-*.md` (ADR-0001). ADR-0004
and ADR-0006 say that boundaries and the framework-free shared models are
"checked by lint", but no tool checks them yet. Today only the
`code-review` skill looks at them: an agent that reads the code
after it was written, sees what it happens to read and may miss a
violation the next time it looks. Most code is written by agents, and a
rule that breaks without anything failing is soon broken in many places.

The rules fall into five kinds:

1. **Dependencies between parts of the code:** apps never import each
   other; domains use only the domains they may, and only through their
   `api/`; layers inside a domain point in one direction (ADR-0014);
   `shared/` imports no domain; the app level uses domains only through
   their `api/`.
2. **Imports of packages:** `models/` and `libs/domain` import no
   framework; `libs/protocol` depends only on Zod and `libs/domain`; only
   entry points import `@greyhoarder/protocol`.
3. **Names and folders:** the folders a domain may contain, kind suffixes,
   `http-<resource>-adapter.ts`, the `schemas/` subfolder.
4. **Content:** no `forwardRef()`, no direct `EventEmitter2`, ports as
   abstract classes, no string tokens.
5. **Cycles** between files.

The client is linted with ESLint, the server with oxlint, whose support for
ESLint plugins is still in alpha. The libraries have no linter and no
tests.

Two tools fit these kinds. **Sheriff** checks dependencies between modules:
folders are tagged by pattern (`domains/<domain>/<layer>`), and dependency
rules between tags decide which imports are allowed. It runs as an ESLint
plugin or on its own as a CLI (`sheriff verify`). **ArchUnitTS** is a port
of Java's ArchUnit: architecture rules written as unit tests, with
dependency, cycle, naming and custom content rules.

A trial run of both against the current code showed:

- Sheriff reads the `sheriff.config.ts` next to the `tsconfig.json` nearest
  to the entry file, so each app needs its own config. It checks only files
  reachable from that entry file, and it does not follow imports of
  packages, including the workspace packages `@greyhoarder/*`.
- With one rule function over the domain and layer tags, the guide's lists
  of allowed dependencies map onto Sheriff almost one to one. Violations
  end the CLI with exit code 1.
- Writing the rules down exactly showed gaps in the guide: it does not say
  who may use the server's `config/` and `platform/` (domains do both
  today), and it allows both `models → util` and `util → models`.
- ArchUnitTS reads file content relative to the working directory. From
  the wrong directory it sees every file as empty, and content rules pass
  without checking anything.

## Decision

Architecture rules that a tool can check are checked by a tool, in the
same runs as lint and tests:

- **Sheriff checks dependencies between modules** (kind 1). Each app has a
  `sheriff.config.ts` in its folder. Folders are tagged with their domain
  and layer by placeholders; one rule function decides from those tags,
  using the guide's lists of allowed domain and layer dependencies. Each
  app's `lint` script runs `sheriff verify`, so `npm run lint` fails on a
  violation. Sheriff runs as the CLI only, the same way in both apps.
- **ArchUnitTS checks everything else a tool can check** (kinds 2 to 5).
  The tests live in a workspace of their own, `tests/architecture`, beside
  `tests/e2e`, with one spec file for the client, one for the server and one
  for the libraries. They run with Vitest (ADR-0012) as part of `npm test`.
  Each suite runs with the folder it checks as its working directory.
- **Architecture tests are tests.** ADR-0012 applies: descriptions state
  the rule in domain terms, and each case is approved by the user. Each
  Sheriff rule and each test refers to the section of the guide it checks;
  the reasoning stays in the ADRs.
- **A rule and its check change together.** Changing a rule in
  `docs/architecture-*.md` includes changing its check in the same change.
  Rules that no tool can check (whether something is a business rule,
  where a type belongs) stay with the `code-review` skill.
- **No exceptions lists.** The checks are turned on green: violations
  found when a check is added are fixed, or the rule is clarified in the
  guide first. A rule is not weakened in the config to make a check pass.

### Alternatives considered

- **Rules in the existing linters** (`no-restricted-imports` in ESLint and
  oxlint): no new tool, but import patterns cannot say "only the same
  domain" or "only another domain's `api/`" without one entry per pair,
  the rules would be written twice in two linters, and the libraries are
  not linted at all.
- **eslint-plugin-boundaries:** expressive element types and rules, but
  ESLint only; the server would depend on oxlint's alpha plugin support.
- **dependency-cruiser:** one mature tool for dependencies, package imports
  and cycles, but its rules are regular expressions over paths, harder to
  read next to the guide and to keep in line with it. It remains the
  fallback if Sheriff falls short.
- **Sheriff only:** covers the most important kind, but not package
  imports, names, content or cycles.
- **ArchUnitTS only:** one tool, but every allowed dependency becomes a
  rule or test of its own, and it has no notion of a module's public API.
  The guide's lists map much more directly onto Sheriff's tags.
- **Sheriff's ESLint plugin in the client:** violations show in the
  editor and cover spec files too, but it is a second integration for one
  app only. It can be added later without changing this decision.
- **ArchUnitTS tests inside each workspace:** no extra workspace, but the
  client's tests run through the Angular builder, which bundles them for
  jsdom, and the libraries have no test runner.
- **Nx module boundaries:** the reference for tag-based rules, but needs
  Nx, which ADR-0006 left out as more tooling than needed.
- **Review only** (the `code-review` skill): no tooling, but not
  deterministic and only after the fact.

## Consequences

- An import across a boundary, a framework in `models/` or a misnamed
  adapter fails `npm run lint` or `npm test` before review, the same way
  every time. The promises in ADR-0004 and ADR-0006 become true.
- New development dependencies: `@softarc/sheriff-core` in both apps, and
  `archunit` and Vitest in `tests/architecture`. Both tools are young
  (Sheriff before 1.0, ArchUnitTS with a small team of maintainers). The
  configs and tests are small, so either can be replaced if it is
  abandoned.
- The gaps the trial found must be closed in the guide before the checks
  go green: who may use the server's `config/` and `platform/`, and
  whether `util/` may use `models/`.
- The lists of domains and their allowed dependencies exist in the guide
  and in the Sheriff configs. A new domain or dependency changes both.
- Sheriff does not see spec files, files no route or module reaches, or
  the libraries. ArchUnitTS covers the libraries; spec files are not
  checked.
- Content rules depend on the working directory. Each suite needs one
  check that the files it reads are not empty, or a wrong directory makes
  all of them pass silently.
- The `code-review` skill can leave out what the tools check and
  look at what they cannot.
