# ADR-0005: MongoDB as database

- **Status:** Accepted
- **Date:** 2026-10-21

## Context

Greyhoarder stores two groups of data with very different shapes.

**Reference data** describes what exists and is not created by the user.
It falls into two kinds that change independently of each other:

- **Product data** (boxes, the kits inside them, model types): products are
  re-released over time, sometimes under the same name with new contents.
- **Rules data** (datasheets, points): rules change with every edition and
  points update, and their structure differs between game systems. The
  main source (BSData) is nested XML.

Both kinds are naturally document-shaped and need to keep older versions.

**Inventory data** (owned boxes, models, hobby status, photos) is created
by the user. It is stable and reference-heavy, but small — thousands of
documents per instance, not millions.

## Decision

We use MongoDB, accessed through Mongoose via `@nestjs/mongoose`.

- Reference data is stored as versioned documents: a re-release,
  a new edition or a points update adds documents instead of changing
  existing ones or migrating schemas.
- MongoDB runs as a single-node replica set so that multi-document
  transactions are available.

### Alternatives considered

- **PostgreSQL with JSONB**: foreign keys for collection data plus document
  storage for reference data. A strong option; rejected mainly for
  familiarity and to keep one data model (documents) throughout the
  project.
- **SQLite**: simplest to self-host, but weak for flexible, nested
  reference data.

## Consequences

- Changing structures in reference data need no schema migrations, and
  older versions stay available for collections that still refer to them.
- At the expected data volume, `$lookup` performance is not a concern.
- MongoDB has no foreign keys: referential integrity is the application's
  responsibility and must be covered by tests.
- Transactions require a replica set, which adds one setup step to the
  Docker deployment.
