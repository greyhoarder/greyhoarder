# ADR-0012: Unit tests with Vitest

- **Status:** Accepted
- **Date:** 2026-10-21

## Context

The repository has three TypeScript workspaces: the Angular client
(see ADR-0002), the NestJS server (see ADR-0003) and the framework-free
shared domain models in `libs/domain` (see ADR-0006). Each needs unit tests,
and several ADRs already require tests: referential integrity (ADR-0005) and
per-domain ownership scoping (ADR-0010).

Much of the code is written by AI agents. One test framework with one API
across all workspaces means agents write tests the same way everywhere, and
a test can move with its code, for example from the server into
`libs/domain`.

The frameworks' defaults point the same way:

- Angular has used Vitest as its default unit test runner since v21. The
  client already runs Vitest through the Angular CLI (`ng test`) with jsdom.
- The NestJS 12 CLI generates new ES module projects with Vitest and only
  CommonJS projects with Jest. The ES module template needs no SWC plugin
  for decorator metadata.
- `libs/domain` is plain TypeScript and needs no framework integration.

Tests written by agents tend to be weak in a specific way: descriptions like
"should work" or "should set signal" that only make sense next to the code,
tests that check implementation details instead of behavior, and tests that
are quietly rewritten until they pass. A test suite is only useful if a
reader who has not seen the code understands what each test promises. This
cannot be checked by a tool, so it needs a human decision per test.

## Decision

- **Vitest** is the unit test framework for every workspace: client, server
  and libs.
- All workspaces use the same Vitest major version.
- The client runs its tests through the Angular CLI (`ng test`, builder
  `@angular/build:unit-test`) with jsdom. The server and libs run Vitest
  directly (`vitest run`), each with its own config. There is no shared
  root Vitest config, because the Angular builder owns the client's config.
- The server is an ES module project, as the NestJS Vitest setup requires.
- Spec files are named `<file>.spec.ts` and live next to the code they test.
- Tests use Vitest's globals (`describe`, `it`, `expect`, `vi`) and `vi` for
  mocks and spies.
- Required coverage, by content rather than by percentage:
  - every business rule in `libs/domain`;
  - component and service logic in the client, tested through the DOM and
    public API;
  - server logic in services and guards.
- **Every Angular component has a spec file.** Generated Spartan `helm`
  components in `shared/ui/helm/` are exempt; they are pulled from upstream
  (ADR-0011).
- **Test descriptions are written for a reader who has not seen the code.**
  `describe` names the unit in domain terms (e.g. `Login page`); each `it` is
  one full sentence describing one behavior as the user or caller sees it,
  without "should" and without implementation terms such as signals,
  selectors or method names. Inside a test, arrange, act and assert are
  separated by a blank line.
- **Each test case is approved by the user.** Agents first propose test cases
  in plain language and write, change or delete a test case only after the
  user has approved that case. A failing test is reported, not adjusted to
  pass.
- The approval is backed by tooling: Claude Code asks for permission before
  any edit to a spec file, and a stop hook reports components without a spec
  file when the agent finishes.
- Integration tests against MongoDB and Redis, API end-to-end tests and
  browser end-to-end tests are out of scope. They are decided in a later ADR,
  once the server exists.

### Alternatives considered

- **Jest everywhere**: mature and the old Nest default, but no longer
  Angular's default, needs SWC or ts-jest for Nest, and is tied to CommonJS.
- **Jest for the server, Vitest for client and libs**: follows each
  framework's older default, but gives agents two APIs (`jest.fn` vs.
  `vi.fn`) and makes moving tests between workspaces harder.
- **Karma/Jasmine for the client**: deprecated in Angular.
- **Vitest browser mode instead of jsdom**: closer to real browsers, but
  needs Playwright and is slower. jsdom is enough for unit tests; real
  browsers belong to the later end-to-end decision.
- **Coverage percentage thresholds**: easy to measure, but invite tests
  written for the number. Coverage is required by content instead.
- **Reviewing tests only in the pull request**: no extra steps while
  working, but tests arrive in bulk and weak descriptions slip through.
  Approving each case before it is written keeps the review small.
- **Testing generated `helm` components**: complete, but tests code we
  pull from upstream and rarely change.

## Consequences

- One test API across the repository; agents and humans write tests the
  same way in every workspace.
- The server is committed to ES modules. Libraries that only work with
  CommonJS need extra care.
- Vitest versions must be upgraded together. Angular pins the client's
  Vitest version, so the server and libs follow the version Angular
  supports.
- `npm test` at the root runs each workspace's own test script; there is no
  single combined Vitest run or report.
- The tests ADR-0005 and ADR-0010 require are integration tests and are not
  covered until the follow-up ADR.
- Writing tests takes more of the user's time: every case needs an
  approval. In return, every test in the repository has a description a
  human has agreed to.
- The permission prompt only covers the agent's file tools; a test changed
  through the shell is caught only by the rule itself and by review.

## Derived rules

- Write unit tests with Vitest; no Jest, Karma or Jasmine.
- Use the same Vitest major version in every workspace.
- Client tests run through `ng test` with jsdom; server and libs use
  `vitest run`.
- The server is an ES module project.
- Name spec files `<file>.spec.ts` and place them next to the code they
  test.
- Use Vitest globals and `vi` for mocks; no other mocking library.
- Every business rule in `libs/domain` has unit tests.
- Test components through the DOM and public API, not private members.
- Every Angular component has a spec file, except generated `helm`
  components.
- `describe` names the unit in domain terms; each `it` is one sentence
  describing one behavior, without "should" and without implementation
  terms.
- Separate arrange, act and assert with a blank line.
- Write, change or delete a test case only after the user has approved that
  case.
- Report a failing test instead of changing it to pass.
