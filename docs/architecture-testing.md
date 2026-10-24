# Architecture: testing

Rules for unit tests in the client, the server and `libs/`, and for browser
end-to-end tests in `apps/e2e`. Integration and API tests are not covered
yet. To write or change tests, follow the `write-tests` skill.

## Framework and setup

- Write unit tests with Vitest; no Jest, Karma or Jasmine.
- Use the same Vitest major version in every workspace.
- Client tests run through `ng test` with jsdom; server and libs use
  `vitest run`.
- The server is an ES module project.

_(derived from [ADR-0012](adr/0012-unit-tests-with-vitest.md))_

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
- Good: `it('shows "Enter your username." when the form is sent without a username')`.
  Bad: `it('should set username error')`.

_(derived from [ADR-0012](adr/0012-unit-tests-with-vitest.md))_

## What must be tested

- Every Angular component has a spec file, except generated `helm`
  components in `shared/ui/helm/`.
- Every business rule in `libs/domain` and in a domain's `model/` has unit
  tests.
- Component and service logic in the client.
- Server logic in services and guards.

_(derived from [ADR-0012](adr/0012-unit-tests-with-vitest.md))_

## End-to-end tests

- Write browser end-to-end tests with Playwright in `apps/e2e`.
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

## Approval

- Write, change or delete a test case only after the user has approved that
  case. This applies to unit and end-to-end tests.
- Report a failing test instead of changing it to pass.

_(derived from [ADR-0012](adr/0012-unit-tests-with-vitest.md),
[ADR-0013](adr/0013-browser-e2e-tests-with-playwright.md))_
