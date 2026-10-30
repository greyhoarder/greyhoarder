---
name: code-review
description: Review a code change in greyhoarder against the architecture rules and for design quality, once, at the end of every code change. Use after the sensors passed, before reporting a code change as done, or when asked to review code or architecture.
---

# Code review

One review per code change, after the sensors (lint, tests, build) ran.
Report only; change nothing unless asked.

1. **Scope:** the changed files (`git status --short`, `git diff HEAD`),
   or the files, folder or domain the user names. Read only the scope.
2. **Sensors:** don't run lint, tests or build again. Use the stop hook's
   result; if none is at hand, run `npm run check:changed` once. Report
   its failures first, and at the end of a feature the end-to-end result.
3. **Guides:** read only the guides `AGENTS.md` routes the changed paths
   to. Skip what Sheriff, ArchUnitTS, ESLint, oxlint and Prettier already
   check.
4. **Architecture** (rules of those guides), in particular:
   - boundaries: business rules only in `models/` or `libs/domain`; types
     one app knows stay in its `models/`; one Nest module per domain;
     client `application/` grouped by subject; stores hold no search,
     filters, selection or projections;
   - persistence: no queries into other domains' collections; multi-document
     writes in a transaction;
   - security: endpoints protected unless `@Public()`, admin endpoints
     `@Roles('admin')`, current user only via `@CurrentUser()`, user data
     scoped by `ownerId`, no passwords or session IDs in logs;
   - UI and Angular: Spartan + Tailwind, theme tokens, `shared/ui/` free
     of domain terms; standalone, signals, `inject()`, native control flow;
   - testing: required tests present, cases approved, descriptions by the
     rules of `docs/architecture-testing.md`.
5. **Design quality,** only where it hurts readability, changeability or
   testability: Fowler's smells (long functions, long parameter lists,
   feature envy, data clumps, primitive obsession, shotgun surgery,
   duplicated business rules, dead code), SRP, single level of
   abstraction, Law of Demeter, cohesion, shallow modules, locality of
   behaviour. Name the smell and the refactoring.
6. **Use case:** the change does what the scenarios of its use case say
   (`docs/use-cases/`), and the tests name or cover them.
7. Report in this form:

```
## Code review: <scope>
Sensors: passed | <failures>
Result: OK | Findings

| # | File:line | Rule / smell | Finding | Suggested fix | Weight |
|---|-----------|--------------|---------|---------------|--------|

Weight: must (breaks a rule or risks a bug) · should (makes the next
change harder) · could (minor).

Notes: <conflicting rules, outdated docs, trade-offs>
```

Never change the architecture rules, the coding guidelines or ADRs. If a
rule seems wrong or two rules conflict, say so under Notes.
