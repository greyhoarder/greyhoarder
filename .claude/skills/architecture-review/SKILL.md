---
name: architecture-review
description: Review code or a planned change against greyhoarder's architecture rules (boundaries, persistence, security, UI). Use before larger structural changes or when asked to review architecture.
---

# Architecture review

1. Determine the scope: the files of the current change (`git diff`), or the
   folder/domain the user names.
2. Read the guides that match the scope, as routed in `AGENTS.md`. They are
   the source of truth; the ADRs in `docs/adr/` explain the reasoning.
   - Always: `docs/architecture-boundaries.md`
   - Server code: `docs/architecture-boundaries-server.md`
   - Client code: `docs/architecture-boundaries-client.md`
   - Schemas, queries, MongoDB, migrations:
     `docs/architecture-persistence.md`
   - Accounts, sessions, guards, user-owned data, hosting:
     `docs/architecture-security.md`
   - Angular code in the client: `docs/architecture-angular.md`
   - Components, templates, styling: `docs/architecture-ui.md`
   - Tests: `docs/architecture-testing.md`
3. Run `npm run lint` and `npm test` first and include their failures in
   the report. Sheriff (`sheriff.config.ts` in each app) checks the
   dependencies between domains, layers, the app level and `shared/`; the
   architecture tests in `tests/architecture` check the other rules a tool
   can check (see "Architecture tests" in `docs/architecture-testing.md`).
   Don't repeat what they check; review what they cannot, such as whether
   something is a business rule or where a type belongs.
4. Check each file against the rules of those guides, in particular:
   - **Boundaries:** correct domain folder; business rules only in
     `models/` or `libs/domain`; `libs/domain` holds what must mean the
     same on both sides (terms and invariants on shared types), even if
     only one app uses it so far, never secrets or server-only state;
     types only one app knows stay in its `models/`; one Nest module per
     domain.
   - **Client layers:** `application/` grouped by subject (`boxes/`,
     `minis/`), what spans subjects at its top, no folders by kind or per
     use case; projections, filters and sort orders are readonly types and
     pure functions, use cases and screen state the classes that hold
     state; features share no smart components; stores hold no search,
     filters, selection or projections.
   - **Persistence:** every collection has a schema owned by one domain; no
     queries or `$lookup` into other domains' collections; references
     checked and indexed; multi-document writes in a transaction; reference
     data never updated in place.
   - **Security:** endpoints protected unless `@Public()`; admin endpoints
     `@Roles('admin')`; current user only via `@CurrentUser()`; user-owned
     data scoped by `ownerId`; no plain passwords or session IDs in logs.
   - **UI:** Spartan + Tailwind only; `shared/ui/` free of domain terms and
     domain imports; theme tokens instead of raw colors; light and dark theme.
   - **Angular:** standalone components, signals, `inject()`, native
     control flow, zoneless; no NgModules or constructor injection.
   - **Testing:** Vitest only; specs named `<file>.spec.ts` next to the
     code; mocks only via `vi`; required tests present.
5. Report in this format and do **not** change code unless asked:

```
## Architecture review: <scope>
Result: OK | Violations found

| # | File | Guide / rule | Finding | Suggested fix |
|---|------|--------------|---------|---------------|

Notes: <anything ambiguous, rules that seem to conflict>
```

Never change the architecture rules or ADRs. If a rule seems wrong or two
rules conflict, say so under Notes.
