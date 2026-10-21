---
name: code-review
description: Review code quality in greyhoarder for code smells, cohesion and coupling — judgment calls the coding guidelines don't cover. Use when asked to review code, before finishing a larger change, or after the architecture review.
---

# Code review

This review covers design quality. Rule violations (boundaries, security,
testing) are the `architecture-review` skill's job; mention them only if
that review has not run.

1. Determine the scope: the files of the current change (`git diff`), or the
   files, folder or domain the user names. Review only that scope.
2. Read `docs/coding-guidelines.md` and check the scope against it.
3. Then look for the following. Each is a judgment call: report it only
   when it actually hurts readability, changeability or testability, and
   say why.
   - **Code Smells and Refactoring Catalog (Fowler):** long functions,
     long parameter lists, feature envy, data clumps, primitive obsession,
     shotgun surgery, divergent change, speculative generality, dead code,
     duplicated business rules. Name the smell and the refactoring that
     fits.
   - **SRP:** a class or function with more than one reason to change.
   - **Law of Demeter:** chains through other objects' internals
     (`a.b().c().d`).
   - **Cohesion Criteria:** a module, feature or file whose parts don't
     belong together.
   - **Deep Modules (Ousterhout):** shallow wrappers whose interface is as
     complex as what they hide; ports or services that only pass calls
     through.
   - **Locality of Behaviour:** behavior a reader has to collect from many
     files to understand one use case.
4. Don't report style issues that Prettier, ESLint or oxlint catch, and
   don't report personal preferences as findings.
5. Report in this format and do **not** change code unless asked:

```
## Code review: <scope>
Result: OK | Findings

| # | File:line | Smell / principle | Finding | Suggested refactoring | Weight |
|---|-----------|-------------------|---------|-----------------------|--------|

Weight: must (bug risk or blocks change) · should (makes the next change
harder) · could (minor).

Notes: <trade-offs, places where a finding conflicts with a guideline>
```

Never change the coding guidelines. If a guideline seems wrong, say so
under Notes.
