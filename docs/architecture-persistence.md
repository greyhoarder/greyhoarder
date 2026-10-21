# Architecture: persistence

Rules for MongoDB, Mongoose schemas and queries on the server. Which domain
owns which data is covered in
[architecture-boundaries.md](architecture-boundaries.md).

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

## Reference data

- Reference data (products, rules) is never updated in place; a new
  version is a new document.
- Every reference-data document carries the fields that identify its
  version.

_(derived from [ADR-0005](adr/0005-mongodb-as-database.md))_
