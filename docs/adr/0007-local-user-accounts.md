# ADR-0007: Local user accounts

- **Status:** Accepted
- **Date:** 2026-10-21

## Context

A Greyhoarder instance is shared by a household or small group: several
people, each with their own collection. Instances are self-hosted and may
be reachable from the internet, so anyone can reach the login.

The app must be usable right after `docker compose up`. Not every
self-hoster runs an identity provider, and there is no mail server to
rely on.

Code is sliced by domain (see ADR-0004); data is stored in MongoDB
(see ADR-0005).

## Decision

- Greyhoarder manages user accounts itself: username and password.
- Passwords are hashed with Argon2id. Plain passwords are never stored or
  logged.
- There is **no open registration**. On first start, the instance asks for
  an initial administrator. Afterwards, only administrators create
  accounts.
- Two roles: `admin` (manages users and instance settings) and `member`.
- Users can change their own password. There is no email-based password
  reset; an administrator sets a new password instead.
- Administrators can disable and delete accounts. Deleting removes the
  account; data other domains keep for it is removed with it.

### Alternatives considered

- **External identity provider only (OIDC)**: no passwords in Greyhoarder,
  but every self-hoster would need to run an identity provider first.
- **Authentication at the reverse proxy** (forward auth): no account code in
  the app, but ties the app to a specific proxy setup and works poorly for
  packaged clients.
- **Open registration**: convenient, but anyone on the internet could
  create an account on someone's instance.
- **Email-based password reset**: familiar, but requires a mail server on
  every instance.

## Consequences

- An instance is usable immediately after installation.
- Greyhoarder stores password hashes and therefore carries responsibility
  for them: hashing and secure defaults must be correct and tested.
- Without email, a forgotten administrator password needs a recovery path
  on the server itself (e.g. a command in the container). This is decided
  with the deployment.
- An internet-facing login with passwords only is a known weak point.
  A second factor (e.g. TOTP) is a likely follow-up decision.
- Login through an external identity provider can be added later as an
  additional way to sign in.
