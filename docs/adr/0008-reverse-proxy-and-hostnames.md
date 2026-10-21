# ADR-0008: Reverse proxy, multiple hostnames and plain HTTP at home

- **Status:** Accepted
- **Date:** 2026-10-21

## Context

Greyhoarder is self-hosted in a typical home lab: the server runs in a
container, and a reverse proxy (usually Caddy) makes it reachable. The same
instance is used under several hostnames, for example an internal name on
the home network and a public name on the internet.

Public access must be encrypted. Internal access usually is not: internal
names often have no certificate, and the app is sometimes opened directly
by IP address and port. Requiring certificates for every internal name and
device would make setup much harder.

The server is a NestJS application (see ADR-0003).

## Decision

- Public hostnames are served over HTTPS only. TLS is terminated at the
  reverse proxy, which redirects HTTP to HTTPS.
- Plain HTTP is allowed on the home network. The server accepts HTTP
  requests only from private network addresses (loopback, RFC 1918, IPv6
  unique local); the list of trusted networks is configurable. HTTP
  requests from other addresses are rejected.
- A hostname is served either over HTTP or over HTTPS, never both.
- The server trusts forwarded headers (`X-Forwarded-For`,
  `X-Forwarded-Proto`) only from configured proxy addresses, never from
  everyone.
- Hostnames are not configured in the app. Any hostname that reaches the
  server works.
- On every hostname, the web app and the API are served under the same
  origin, so browser clients need no CORS.

### Alternatives considered

- **HTTPS everywhere, including the home network** (e.g. an internal CA):
  most secure, but needs certificates and trusted CAs on every device.
  Rejected as too much setup for a home lab.
- **`trust proxy` for everyone**: no configuration, but any client could
  fake its IP address and scheme.
- **A fixed list of hostnames**: explicit, but every new name needs a
  configuration change.
- **Web app and API on different origins**: allows hosting them
  separately, but requires CORS and complicates cookies.

## Consequences

- The app works on the home network without certificates, including
  direct access by IP address.
- On the home network, passwords and session cookies travel unencrypted.
  Anyone with access to that network can read them. This is accepted for
  home networks; whoever does not trust their network serves internal
  names over HTTPS as well.
- The HTTP restriction and per-IP rate limiting depend on the client IP
  being correct, which makes the proxy configuration security-relevant.
- New hostnames work without changing the app.

## Derived rules

- Accept plain HTTP only from configured private networks.
- Trust forwarded headers only from configured proxy addresses.
- Never configure or hard-code hostnames in the app.
- Serve the web app and the API under the same origin; no CORS for
  browser clients.
