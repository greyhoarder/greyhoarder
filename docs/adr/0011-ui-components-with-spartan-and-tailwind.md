# ADR-0011: UI components with Spartan UI and Tailwind CSS

- **Status:** Accepted
- **Date:** 2026-10-21

## Context

The client needs a consistent set of UI building blocks (buttons, inputs,
dialogs, cards, menus) from the first feature on. The intended look is
modern, clean and dense with information, in the style of current
collection trackers rather than a classic business application.

The client is written in modern Angular (see ADR-0002) and sliced by
domain, with cross-cutting code in `shared/` (see ADR-0004).
`libs/` holds framework-free code shared between apps (see ADR-0006).

## Decision

### Library

- UI building blocks come from **Spartan UI**, styled with
  **Tailwind CSS**.
- Behaviour and accessibility come from Spartan's unstyled primitives
  (`brain`), installed as an npm dependency.
- The styled components (`helm`) are generated into the client with the
  Spartan CLI and become our own code. They may be changed to fit
  Greyhoarder.
- No other component library is used alongside Spartan.

### Location

- Generated `helm` components and other generic building blocks live in
  `apps/client/src/app/shared/ui/`. This ADR is the agreement required by
  ADR-0004 for this part of `shared/`.
- The Spartan CLI is configured to generate into that directory, never
  into a new package under `libs/`.
- Building blocks contain no business logic and no domain terms. They do
  not import from domains, services or the API.
- Presentational components that use domain terms (e.g. a box card or a
  hobby status badge) live in their domain and are composed from the
  building blocks.

### Styling

- Colors, radii, spacing and fonts are defined once as CSS variables in
  the theme. Components use these tokens, never raw color values.
- The theme has a light and a dark variant.
- Styling is done with Tailwind utility classes in templates. Component
  style files are the exception, not the rule.

### Alternatives considered

- **Angular Material (M3)**: mature and maintained by the Angular team,
  but its look is hard to move away from Material, and deep customization
  fights the library.
- **PrimeNG**: very large component set, but heavy, with its own theming
  system and frequent breaking changes between major versions.
- **Ionic**: mobile-native look and good fit for Capacitor, but ties the
  web app to a mobile design language before packaging is decided.
- **Own components without a library**: full control, but accessible
  dialogs, menus and comboboxes are costly to build correctly.
- **A separate `libs/ui` package**: clean isolation, but only one app
  renders UI. It would also be the first framework-bound library, which
  contradicts ADR-0006. The building blocks have no dependencies into the
  app, so they can move into a library once a second Angular app needs
  them.

## Consequences

- The look is fully under our control; generated components are edited
  like any other code.
- Updates to `helm` components are not automatic. Upstream changes are
  pulled in deliberately, by regenerating and merging.
- Tailwind becomes part of the client's build and of every template.
- Spartan is younger than Material or PrimeNG; missing components are
  built in `shared/ui/` on top of `brain` primitives.

## Derived rules

- Use Spartan UI (`brain` + `helm`) with Tailwind; don't add another
  component library.
- Generate `helm` components into `apps/client/src/app/shared/ui/`; never
  create a UI package under `libs/`.
- `shared/ui/` contains no business logic or domain terms and imports
  nothing from domains.
- Presentational components with domain terms live in their domain and
  build on `shared/ui/`.
- Use theme tokens (CSS variables) for colors, radii, spacing and fonts;
  no raw color values.
- Style with Tailwind classes in templates; use component style files
  only when Tailwind can't express it.
- Every component works in both the light and the dark theme.
