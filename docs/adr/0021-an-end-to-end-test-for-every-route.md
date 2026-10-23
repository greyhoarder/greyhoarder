# ADR-0021: An end-to-end test for every route

- **Status:** Proposed
- **Date:** 2026-10-23

## Context

ADR-0013 requires end-to-end tests for the main path of every screen
described in `docs/screens/`. Pages without a screen spec, and nested routes
such as the tabs of a screen, are not covered by that rule.

Unit tests (ADR-0012) render a component in jsdom on its own. They cannot
show that a route leads to its component, that guards let a user through,
that a lazily loaded chunk loads, or that the page renders in a real
browser. A page can pass all its unit tests and still be unreachable or
blank.

New pages are added often while the client grows, and mostly by agents.

## Decision

- **Every route that loads a component of its own**, nested routes
  included, has at least one end-to-end test that reaches it and checks
  that its component is rendered.
- Reaching the route through the navigation a user would take (a link or
  button) is preferred over opening its address directly, so the way in is
  tested as well.
- "Rendered" is checked through an element of the page's own component, by
  its `data-testid` (ADR-0013); the address alone does not count.
- This is the minimum; the main path of a screen (ADR-0013) still needs its
  own tests. One test can cover several routes it passes through.
- Adding a route includes adding this test, with the test cases approved by
  the user as for every test (ADR-0012).

### Alternatives considered

- **Only screens in `docs/screens/`** (ADR-0013 as it is): fewer tests, but
  pages without a spec and nested routes can break unnoticed.
- **Router unit tests** with `RouterTestingHarness`: fast and run with the
  unit tests, but still in jsdom, without real lazy loading, the built app
  or the server's session.
- **A generated smoke test over all routes**: no test to write per page, but
  needs a list of routes and their test IDs kept next to the routes, and
  hides which way into a page a user takes.

## Consequences

- A route that cannot be reached, or a page that stays blank, fails in
  Chromium, Firefox and WebKit before it is noticed by hand.
- Every routed page component needs at least one `data-testid` that the
  test can wait for.
- Each new page adds an end-to-end test and so a little run time in three
  browsers.
