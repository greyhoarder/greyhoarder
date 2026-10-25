# Architecture: UI

Rules for UI components, templates and styling in the client.

## Component library

- Use Spartan UI (`brain` + `helm`) with Tailwind; don't add another
  component library.
- Generate `helm` components into `apps/client/src/app/shared/ui/`; never
  create a UI package under `libs/`.
- Generated components are our code and may be changed.

_(derived from [ADR-0011](adr/0011-ui-components-with-spartan-and-tailwind.md))_

## Where components live

- `shared/ui/` holds generic building blocks only: no business logic, no
  domain terms, no imports from domains, services or the API.
- Presentational components with domain terms (e.g. a box card or a hobby
  status badge) live in their domain and build on `shared/ui/`.
- Directives and pipes follow the same rule as components: generic ones
  (e.g. keyboard navigation in a menu) belong with the building blocks,
  ones with domain terms in their domain. A pipe only shows a value; the
  rule behind it lives in `models/` or `libs/domain`.

_(derived from [ADR-0011](adr/0011-ui-components-with-spartan-and-tailwind.md))_

## Styling

- Use theme tokens (CSS variables) for colors, radii, spacing and fonts;
  no raw color values.
- Style with Tailwind classes in templates; use component style files only
  when Tailwind can't express it.
- Every component works in both the light and the dark theme.

_(derived from [ADR-0011](adr/0011-ui-components-with-spartan-and-tailwind.md))_
