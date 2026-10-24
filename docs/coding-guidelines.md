# Coding guidelines

Rules for writing code anywhere in the repository: client, server and
`libs/`. Where code lives is covered in
[architecture-boundaries.md](architecture-boundaries.md); framework rules
in the other `architecture-*.md` guides. Judgment calls on finished code
(code smells, cohesion, coupling) are checked by the `code-review` skill,
not here.

Formatting is left to Prettier and EditorConfig. Don't format by hand.

## Principles

Apply **KISS**, **YAGNI**, **DRY**, **SLAP**, **CQS** and **Chesterton's
Fence**. In this project that means in particular:

- No abstractions, options, flags or base classes for cases that don't
  exist yet.
- DRY by the rule of three: extract on the third occurrence. Two copies of
  a business rule are always one too many; it belongs in the domain's
  `model/`, or in `libs/domain` when both apps need it.
- A function either orchestrates or does detail work, never both.
- Don't remove or rewrite code you don't understand; ask why it is there.
- Change only what the task requires. Report problems you notice in
  surrounding code instead of fixing them on the side.

## Naming

- Variables, functions and properties are `camelCase`; classes and types
  are `PascalCase`; fixed configuration values are `UPPER_SNAKE_CASE`.
- File names are `kebab-case` with a kind suffix: `login-page.ts`,
  `session.guard.ts`, `redis-session-registry.ts`.
- English domain terms, spelled out; only established abbreviations (`id`,
  `url`, `dto`).
- Booleans read as a question (`isPublic`, `hasSession`); functions start
  with a verb (`findByOwner`).
- No type prefixes or suffixes: `UserRepository`, not `IUserRepository`.
- Implementations of external access are named
  `<technology>-<subject>-<role>.ts`: `redis-session-registry.ts`,
  `http-setup-adapter.ts`.

## Types

- No `any`; use `unknown` and narrow it.
- No non-null assertions (`value!`) outside tests.
- No type assertions (`as`) except right after validation at the edge
  (e.g. by a Zod schema).
- Exported functions and public methods declare their return type.
- String literal unions instead of `enum`: `type Role = 'admin' | 'member'`.
- `readonly` for data that must not change.
- `undefined` for "no value"; `null` only where an external API needs it.

## Functions

- At most three parameters; beyond that, one object.
- No boolean parameters that switch behavior; write two functions or use a
  named option.
- Return early; at most two levels of nesting.
- Don't mutate parameters.

## Errors

- Never swallow an error. A `catch` handles it (recover, retry, translate)
  or rethrows it; logging alone is not handling.
- Throw named `Error` subclasses (`UsernameTakenError`), never strings or
  plain objects.
- Don't signal failure with `undefined`, `null` or `false`.
- Validate at the edge and fail fast; trust data inside the program instead
  of checking it again everywhere.
- Translate errors into HTTP statuses or UI messages only in entry points.

## Async

- `async`/`await`, no `.then()` chains.
- No floating promises.
- Independent work runs in parallel with `Promise.all`.

## Modules and comments

- One exported class, interface or type per file, and the file is named
  after it (`catalog-kit-queries.ts` holds `CatalogKitQueries`). Types that
  exist only as part of it may stay in its file: the parameter and result
  types of a service (those of a port live in `model/`), the parts of a domain model (`KitSlot` in
  `catalog-kit.ts`), nested Mongoose sub-schemas. A protocol file holds
  the request and response of one endpoint. Functions are not affected;
  generated code (`shared/ui/helm/`) is exempt.
- Named exports only; no default exports, no `export *`.
- Barrel files exist only as `api/index.ts` in the apps and as
  `<domain>/index.ts` in `libs/`.
- Comments explain *why*, never *what*. No commented-out code.
- Public API in `api/index.ts` and in `libs/` gets a short doc comment
  stating the contract.
