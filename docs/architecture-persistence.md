# Architecture: persistence

Rules for MongoDB, Mongoose schemas, queries and migrations on the server.
Which domain owns which data is covered in
[architecture-boundaries-server.md](architecture-boundaries-server.md).

## Schemas and ownership

- Access MongoDB through Mongoose via `@nestjs/mongoose`.
- Every MongoDB collection has a Mongoose schema; no schemaless writes.
- Each MongoDB collection belongs to exactly one domain, and its schema is
  registered only in that domain's module.
- No queries or `$lookup` into another domain's collections.

_(derived from [ADR-0005](adr/0005-mongodb-as-database.md))_

## References and integrity

- Store references as `<entity>Id` fields and index them.
- Before writing a reference, check that the referenced document exists.
- Before deleting a document, check for documents that still reference it.
- Writes that touch several documents run in a transaction.

_(derived from [ADR-0005](adr/0005-mongodb-as-database.md))_

## Migrations

- The server brings an older database up to date by itself on startup.
  Every change to stored data in a release comes with a migration in the
  domain that owns the data.
- Migrations only go forward; there are no down migrations.
- Migrations work on raw collections with fixed collection and field names,
  through the MongoDB driver; never through domain models or Mongoose
  schemas, which describe only the current shape of the data.
- A step with `runs: 'once'` runs once per database. A step with
  `runs: 'onEveryStart'` must be idempotent (running it on its own result
  changes nothing) and atomic on its own.
- A failed update is undone by restoring the copy of the database saved
  before the steps; within a step, use a transaction where it fits.
- Where steps and migrations live is in
  [architecture-boundaries-server.md](architecture-boundaries-server.md),
  "Startup steps".

_(derived from [ADR-0022](adr/0022-self-updating-instances.md),
[ADR-0023](adr/0023-startup-sequence-and-migrations.md))_

## Reference data

- Reference data (products, rules) is never updated in place; a new
  version is a new document.
- Every reference-data document carries the fields that identify its
  version.

_(derived from [ADR-0005](adr/0005-mongodb-as-database.md))_
