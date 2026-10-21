# Architecture: testing

Rules for unit tests in the client, the server and `libs/`. Integration and
end-to-end tests are not covered yet. To write or change tests, follow the
`write-tests` skill.

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
- Every business rule in `libs/domain` has unit tests.
- Component and service logic in the client.
- Server logic in services and guards.

_(derived from [ADR-0012](adr/0012-unit-tests-with-vitest.md))_

## Approval

- Write, change or delete a test case only after the user has approved that
  case.
- Report a failing test instead of changing it to pass.

_(derived from [ADR-0012](adr/0012-unit-tests-with-vitest.md))_
