# ADR-0017: Server serves the web app

- **Status:** Proposed
- **Date:** 2026-10-22

## Context

The web app and the API are served under the same origin on every
hostname (see ADR-0008), but nothing says who delivers the built web app.
In development, `ng serve` delivers it and forwards `/api` to the server.

Self-hosters start Greyhoarder with `docker compose up` (see ADR-0007). A
reverse proxy is needed only for public hostnames; on the home network,
the server may be reached over plain HTTP without one (see ADR-0008).

End-to-end tests should run against several complete, separate instances
at once, each under its own origin.

## Decision

- In production, the NestJS server serves the built client through
  `@nestjs/serve-static`. One process and one image deliver the web app and
  the API; a reverse proxy, where present, only terminates TLS and forwards
  requests.
- The server serves the files from a configured directory. Without that
  configuration it serves only the API, so development keeps `ng serve`
  with live reload and its proxy to `/api`.
- Paths under `/api` are never answered with the web app; an unknown API
  path gets the API's 404. Every other path without a matching file gets
  `index.html`, so client routes survive a reload.
- Files with a content hash in their name are cached for a long time and
  marked immutable; `index.html` is never cached, so a browser picks up a
  new release on the next load.
- Session handling applies only to `/api`; requests for files of the web
  app never touch Redis.
- Serving the web app is platform setup at app level
  (`apps/server/src/platform/`), next to Redis and sessions, not part of a
  domain.

### Alternatives considered

- **The reverse proxy serves the files** (e.g. Caddy `file_server`): no
  static files in the server, but an instance on the home network without a
  proxy would have no web app, and the app would depend on one proxy
  setup.
- **A separate web container** (e.g. nginx with the client build): a
  common split, but two images, and nginx would need to forward `/api` to
  the server, which adds a hop and a second place for routing.
- **Static serving written by hand** with `express.static`: no new
  dependency, but the exclusion of `/api` and the fallback to `index.html`
  would be rebuilt instead of configured.
- **Server-side rendering**: faster first paint and indexable pages, which
  a private collection behind a login does not need.

## Consequences

- Self-hosters run one image for the app; the client and the API of an
  instance always come from the same release.
- Every request for a file of the web app passes through the server
  process. For a household this load does not matter.
- The files of the web app are public: anyone who reaches the server can
  load the login page and the code of the client, but no data.
- `@nestjs/serve-static` becomes a dependency of the server.
- Security headers for the web app (e.g. a content security policy) are
  now the server's job and are decided separately.
