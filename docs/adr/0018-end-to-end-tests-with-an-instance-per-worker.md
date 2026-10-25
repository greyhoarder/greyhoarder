# ADR-0018: End-to-end tests with an instance per worker

- **Status:** Proposed
- **Date:** 2026-10-22

## Context

Browser end-to-end tests run in Chromium, Firefox and WebKit, and each test
must be independent of the others (see ADR-0013). ADR-0013 left open how
test data is prepared once the server exists.

The server now exists, and it has state that tests cannot share without
getting in each other's way:

- The initial setup works exactly once per instance (see ADR-0007). With
  three browsers running in parallel, only one could complete it.
- Almost every later test needs a signed-in user.
- Failed logins are counted per IP address and per username (see
  ADR-0009). All tests come from the same address, so failed logins of one
  test can lock out others.

The server serves the web app itself (see ADR-0017), so one server process
is a complete instance under one origin. MongoDB runs as a single-node
replica set (see ADR-0005), Redis holds sessions and login attempts.

## Decision

- **Each Playwright worker runs its own instance:** its own server
  process, started from the built client and server, on its own port, with
  its own MongoDB database and its own Redis database index. The MongoDB
  and Redis containers are shared by all workers.
- A worker fixture starts the instance, waits until `GET /api/health`
  answers, and stops it when the worker ends. The health endpoint is
  public and reports only whether the server is ready.
- A test that needs a known starting state gets it from a fixture that
  resets its worker's instance: it drops the worker's database and flushes
  its Redis database, directly and not through the app. The app has no
  reset endpoint and no test mode.
- **Test data is created only through the public API**, including the
  initial setup and signing in; tests never write to the database. Hashing,
  rules and validation then run exactly as for users.
- Tests that are not about the setup or the login start from a fixture
  that sets up the instance and signs in through the API. The setup and
  login screens are tested through the user interface.
- API requests from tests send the instance's origin as `Origin`, as a
  browser would (see ADR-0009).
- Database names for end-to-end tests carry their own prefix, so a run can
  never reset development or production data.
- In CI, client and server are built, MongoDB (as a single-node replica
  set) and Redis are started as containers, and Playwright runs against
  them.

### Alternatives considered

- **One shared instance with ordered Playwright projects** (setup tests
  first, then a seed, then all other tests): one server only, but tests
  share data, sessions and login counters, the setup runs once for all
  browsers, and the order is a hidden dependency between tests.
- **A reset or seed endpoint in the app**: simple to call, but a backdoor
  in every production instance, guarded only by configuration.
- **One server with a database per request** (selected by a test header):
  one process, but a test mode inside the app that changes where data goes.
- **Separate containers per worker** (Testcontainers): the strongest
  isolation, but seconds of startup per worker and Docker inside the
  development container. It remains the next step if shared containers are
  not enough.
- **Seeding by writing to the database**: fast, but bypasses hashing and
  rules, and breaks whenever `auth` changes how passwords are stored.
- **Testing the Docker image instead of the build**: closest to what
  self-hosters run, but needs an image build for every run. It is a later
  step once the image exists.

## Consequences

- Tests run in parallel in all three browsers without affecting each
  other; independence no longer depends on discipline.
- Each worker pays the startup of a server process. The number of workers
  is limited by the Redis databases available (16 by default).
- End-to-end tests run against a build, not against `ng serve`; a change
  needs a rebuild before the tests see it.
- `tests/e2e` needs a MongoDB driver and a Redis client to reset instances.
- The server gets a health endpoint, which deployments can use as well.
- Integration tests of the server against MongoDB and Redis are still
  open and are decided separately.
