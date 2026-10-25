# Architecture: testing

Rules for unit tests in the client, the server and `libs/`, for browser
end-to-end tests in `tests/e2e` and for architecture tests in
`tests/architecture`. Integration and API tests are not covered yet. To write or change tests, follow the `write-tests` skill.

## Framework and setup

- Write unit tests with Vitest; no Jest, Karma or Jasmine.
- Use the same Vitest major version in every workspace.
- Client tests run through `ng test` with jsdom; server and libs use
  `vitest run`.
- The server is an ES module project.

_(derived from [ADR-0012](adr/0012-unit-tests-with-vitest.md))_

## What tests check

Tests check use cases, not code: what a user or caller can do and
observe, not how the code does it.

- "As the tests get more specific, the code gets more generic" (Robert C.
  Martin). Each new test adds one specific case of a use case; the code
  answers by becoming a more general solution, not by gaining a branch
  per test.
- A test describes a behavior a user or caller relies on. It does not
  mirror the code's structure: no test per method, per branch or per
  helper.
- A refactoring that keeps the behavior keeps every test green and
  unchanged. A test that breaks on such a refactoring checks the code,
  not the use case.
- A test case changes only when its use case changes.
- A rule is tested where it lives (`models/`, `libs/domain`), with a case
  per specific situation. A component that uses it gets one case showing
  the rule's result, not the rule again.
- Tests find elements by test IDs, roles or ARIA attributes, never by CSS
  classes; a restyle keeps them green.

## Writing tests

- Name spec files `<file>.spec.ts` and place them next to the code they
  test.
- Use Vitest globals and `vi` for mocks; no other mocking library.
- Test components through the DOM and public API, not private members.
- Separate arrange, act and assert with a blank line.

_(derived from [ADR-0012](adr/0012-unit-tests-with-vitest.md))_

## Test descriptions

- `describe` names the unit in domain terms, e.g. `Login page`.
- Each `it` is one sentence describing one behavior as the user or caller
  sees it, without "should" and without implementation terms (signals,
  selectors, method or class names).
- Start with the same verb for the same kind of check:
  - `says …` for text the user reads: messages, errors, hints, empty
    states (`says that …`, `says "<text>" when …`);
  - `shows …` for visible content and elements: rows, cards,
    placeholders, images;
  - `tells screen readers …` for what only screen readers announce;
  - `names …` for a value put into words (a status, a progress).
- Good: `it('says "Enter your username." when the form is sent without a username')`.
  Bad: `it('should set username error')`.

_(derived from [ADR-0012](adr/0012-unit-tests-with-vitest.md))_

## What must be tested

- Every Angular component has a spec file, except generated `helm`
  components in `shared/ui/helm/`.
- Every business rule in `libs/domain` and in a domain's `models/` has unit
  tests.
- Component and service logic in the client.
- Server logic in services and guards.

_(derived from [ADR-0012](adr/0012-unit-tests-with-vitest.md))_

## End-to-end tests

- Write browser end-to-end tests with Playwright in `tests/e2e`.
- Run every end-to-end test in Chromium, Firefox and WebKit.
- Find elements by `data-testid` only; never by text, role, label or CSS
  class.
- Name test IDs in kebab-case, starting with the screen name
  (`login-username`).
- Use waiting assertions; no fixed waits.
- Keep tests independent of each other.
- Every screen in [screens/](screens/README.md) has end-to-end tests for its
  main path.
- The description rules above apply to end-to-end tests as well.

_(derived from [ADR-0013](adr/0013-browser-e2e-tests-with-playwright.md))_

## End-to-end test for every route

- Every route that loads a component of its own, nested routes included,
  has at least one end-to-end test that reaches it and checks that its
  component is rendered.
- Prefer reaching the route the way a user would, through a link or button,
  over opening its address directly.
- Check the rendering through an element of the page's own component, by
  its `data-testid`; the address alone does not count.
- One test may cover several routes it passes through; the main path of a
  screen still needs its own tests.
- Adding a route includes adding this test.

_(derived from [ADR-0021](adr/0021-an-end-to-end-test-for-every-route.md))_

## End-to-end test instances

- Each Playwright worker runs its own instance: a server process from the
  built client and server, on its own port, with its own MongoDB database
  and its own Redis database index.
- Start and stop a worker's instance in a worker fixture; wait for
  `GET /api/health` before the first test.
- Reset an instance only through the test fixture, directly against its
  MongoDB database and Redis database. Never add reset endpoints, seed
  endpoints or test modes to the app.
- Create test data only through the public API, including the initial
  setup and signing in; never write to the database from tests.
- Tests that are not about the setup or the login start signed in through
  the API fixture; test the setup and login screens through the UI.
- Send the instance's origin as `Origin` with every API request from tests.
- Prefix database names for end-to-end tests (`greyhoarder-e2e-`); never
  point tests at a development or production database.
- In CI, build client and server, start MongoDB as a single-node replica
  set and Redis as containers, then run Playwright.

_(derived from [ADR-0018](adr/0018-end-to-end-tests-with-an-instance-per-worker.md))_

## Architecture tests

- Dependencies between domains, layers, the app level and `shared/` are
  checked by Sheriff (`sheriff.config.ts` in each app, run by
  `npm run lint`); see [architecture-boundaries.md](architecture-boundaries.md).
- Everything else a tool can check (imports of packages, names, content,
  cycles) is tested with ArchUnitTS in `tests/architecture`: one spec file
  each for the client, the server and the libraries, run by `npm test`.
- Each Sheriff rule and each test names the guide section it checks.
  Changing a rule includes changing its check in the same change.
- No exceptions lists: a violation is fixed, or the rule is clarified in the
  guide first; never weaken a check to make it pass.
- Each suite runs with the folder it checks as its working directory and
  that folder's build tsconfig, so spec files are not checked.
- Each suite has a test that the files it reads are not empty; otherwise a
  wrong working directory lets every content rule pass silently.
- Read imports of packages from the file content, not from the resolved
  dependency graph; the graph skips packages that do not resolve, such as
  unbuilt workspace libraries.
- The description and approval rules above apply to architecture tests as
  well.

_(derived from [ADR-0024](adr/0024-architecture-tests-with-sheriff-and-archunitts.md))_

## Approval

- Write, change or delete a test case only after the user has approved that
  case. This applies to unit and end-to-end tests.
- Report a failing test instead of changing it to pass.

_(derived from [ADR-0012](adr/0012-unit-tests-with-vitest.md),
[ADR-0013](adr/0013-browser-e2e-tests-with-playwright.md))_
