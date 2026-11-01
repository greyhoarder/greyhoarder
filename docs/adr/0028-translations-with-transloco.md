# ADR-0028: Translations with Transloco

- **Status:** Proposed
- **Date:** 2026-11-01

## Context

A user can choose a language on their profile; it is stored with the
account ([PROFILE](../use-cases/edit-your-profile.md)), but the app stays in
English, and its texts stand directly in the templates and the code.
Greyhoarder ships as one Docker image that a household runs on its own
hardware, and members of one instance may want different languages. The
language therefore has to change at runtime, per user, from the same build.
Messages need plurals ("1 mini", "3 minis"). Dates are formatted, and the
catalog's names of kits and factions are data, not texts of the app.

## Decision

- **Transloco is the translation engine of the client.** Its directive and
  pipe work with signals and zoneless change detection; the texts of a
  language load at runtime as JSON.
- **English is the source language.** One translation file per language and
  domain, next to the domain (`domains/hoard/i18n/de.json`), loaded with the
  domain's routes, so that a screen loads only what it needs.
- **Keys name the place, not the text** (`hoard.selection.delete`). Plurals
  use ICU messages through Transloco's message format plugin.
- **The stored language of the account decides.** Before signing in, the
  browser's language decides; what is not translated falls back to English.
- **The server sends no display texts.** Errors reach the client as codes,
  and the client words them. Schema messages in `libs/protocol` become codes
  as well.
- **Catalog names stay as they are.** Translating them is a separate
  decision.

### Alternatives considered

- **Angular i18n (`@angular/localize`):** official and without a runtime
  cost, but one build per language: the image grows with every language,
  and changing the language means loading another app.
- **ngx-translate:** the runtime switch works as well, but it has no plural
  support of its own and is built around observables rather than signals.
- **A text service of our own:** no dependency, but plurals, lazy loading,
  missing-key handling and tooling would all have to be written and kept.

## Consequences

- A new dependency, plus one for the message format plugin.
- Every template and every message in code changes once; this happens
  screen by screen, with German as the first language.
- Tests that assert texts run against the English default, and need the
  translation test module.
- The architecture tests can check that a domain's keys exist in each of
  its translation files.
- The strength meter's dictionaries (`@zxcvbn-ts/language-*`) follow the
  chosen language.
