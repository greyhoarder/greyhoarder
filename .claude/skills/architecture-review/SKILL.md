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
   - Schemas, queries, MongoDB: `docs/architecture-persistence.md`
   - Accounts, sessions, guards, user-owned data, hosting:
     `docs/architecture-security.md`
   - Components, templates, styling: `docs/architecture-ui.md`
3. Check each file against the rules of those guides, in particular:
   - **Boundaries:** correct domain folder; other domains imported only via
     `<domain>/api/index.ts`; only allowed domain dependencies; `shared/`
     imports no domain; `libs/domain` is framework-free and imported by
     package name; one Nest module per domain, no `forwardRef()`.
   - **Persistence:** every collection has a schema owned by one domain; no
     queries or `$lookup` into other domains' collections; references
     checked and indexed; multi-document writes in a transaction; reference
     data never updated in place.
   - **Security:** endpoints protected unless `@Public()`; admin endpoints
     `@Roles('admin')`; current user only via `@CurrentUser()`; user-owned
     data scoped by `ownerId`; no plain passwords or session IDs in logs.
   - **UI:** Spartan + Tailwind only; `shared/ui/` free of domain terms and
     domain imports; theme tokens instead of raw colors; light and dark theme.
   - **Angular** ([ADR-0002](../../../docs/adr/0002-angular-as-client-framework.md)):
     standalone components, signals, `inject()`, native control flow,
     zoneless; no NgModules or constructor injection.
4. If `AGENTS.md` lists commands, run lint and tests for the affected
   workspaces and include failures in the report.
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
