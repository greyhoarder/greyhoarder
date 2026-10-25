# ADR-0013: Browser end-to-end tests with Playwright

- **Status:** Accepted
- **Date:** 2026-10-21

## Context

Unit tests (ADR-0012) check components and rules in isolation, in jsdom.
They cannot show that a screen really renders in a browser, that routing,
styles and assets work together, or that a user can complete a task across
several screens. ADR-0012 left browser end-to-end tests to a later decision.

The client is an Angular app (ADR-0002) that will later be packaged for
desktop and mobile. Packaged clients use the engines of Chromium and WebKit,
and self-hosters use any desktop browser.

Tests in this project are written mostly by agents and approved case by
case (ADR-0012). The user wants tests that do not break when a visible
text is reworded.

The server does not exist yet; integration tests against MongoDB and Redis
and API tests are not part of this decision.

## Decision

- **Playwright** (`@playwright/test`) is the framework for browser
  end-to-end tests.
- The tests live in their own workspace, `tests/e2e` (`@greyhoarder/e2e`),
  with their own Playwright configuration. They belong to no domain and test
  the app from the outside, as a user would.
- Every test runs in **Chromium, Firefox and WebKit**.
- Until the server exists, Playwright starts the client dev server itself.
  Once client and server run together, the tests run against the whole
  stack under one origin (ADR-0008).
- **Elements are found by `data-testid` only.** Tests never select by
  visible text, roles, labels or CSS classes, so rewording a text or
  restyling a screen does not break them. Test IDs are kebab-case and
  start with the screen name, e.g. `login-username`.
- Tests use Playwright's waiting assertions (`expect(locator)…`); no fixed
  waits.
- Each test is independent: it neither depends on another test nor leaves
  state another test relies on.
- The description and approval rules of ADR-0012 apply unchanged: readable
  `describe` and `it` texts, and every test case approved by the user before
  it is written, changed or deleted.
- Required coverage: every screen in `docs/screens/` has end-to-end tests
  for its main path. Details and edge cases stay in unit tests.
- Out of scope: visual regression (screenshot comparison), automated
  accessibility checks, API and integration tests.

### Alternatives considered

- **Cypress**: mature and popular, but WebKit support is experimental and
  tests run inside the browser with a more limited model for multiple tabs
  and origins.
- **WebdriverIO / Selenium**: covers real browsers widely, but needs more
  setup and is slower for local runs.
- **Vitest browser mode**: reuses ADR-0012's runner, but is built for
  component tests, not for journeys across screens and a running server.
- **Tests inside `apps/client` (`ng e2e`)**: simpler at first, but end-to-end
  tests will exercise client and server together and fit neither app.
- **Selecting by role and accessible name** (`getByRole`, `getByLabel`):
  Playwright's recommendation and a free accessibility check, but couples
  every test to visible texts. Rejected for stable tests; accessibility is
  checked by unit tests and can get its own tooling.
- **Chromium only**: fastest, but misses the WebKit engine that iOS packaging
  will use.

## Consequences

- Each screen checks routing, rendering and assets in three real engines.
- Every element a test needs carries a `data-testid`, which adds attributes
  to production markup. Building a screen now includes adding its test IDs.
- Tests survive copy and design changes; they break only when behavior or
  structure changes.
- Selecting by test ID no longer verifies accessible names; accessibility
  relies on unit tests until a dedicated check (e.g. axe) is decided.
- Three browsers make runs slower, and each machine needs the Playwright
  browsers installed.
- How test data is prepared once the server exists (seeding, resetting the
  database) is decided with the integration test ADR.
