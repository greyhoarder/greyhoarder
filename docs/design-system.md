# Design system

The visual language of the client: color, type, spacing, shape and how
screens are composed. Where components live and which library builds them is
covered in [architecture-ui.md](architecture-ui.md); individual screens are
specified in [screens/](screens/README.md).

Values live as tokens (CSS variables) in `apps/client/src/styles.css`. This
guide names tokens and Tailwind scale steps, never raw values. Rules marked
as derived from an ADR change only through a new ADR; the visual choices
without such a mark may be refined as the design evolves.

## Principles

- **Calm and dense.** Dark, quiet surfaces; content and collection data come
  first, decoration last.
- **Gold means "done" or "do this".** The logo's shield is half painted gold,
  half grey plastic. The interface follows the same idea: grey for neutral
  and unfinished, gold for the primary action, focus and completed states.
- **One accent.** Gold is the only accent color. It is never used as
  decoration or for large surfaces.
- **Consistency over novelty.** A new screen reuses existing building blocks
  and patterns before inventing new ones.

## Color

Use only the semantic tokens below, through Tailwind classes such as
`bg-card` or `text-muted-foreground`.

| Token | Use |
|-------|-----|
| `background` / `foreground` | Page background and default text |
| `card` / `card-foreground` | Raised surfaces such as cards and dialogs |
| `muted` / `muted-foreground` | Subtle surfaces; secondary text, descriptions, hints |
| `primary` / `primary-foreground` | Gold: primary button, active and completed states |
| `ring` | Focus ring; same hue as `primary` |
| `border` / `input` | Card and field borders |
| `destructive` | Errors and destructive actions |

- No raw color values and no arbitrary color classes (`bg-[…]`).
- The logo files are a brand asset with fixed colors and are exempt.
- Every component works in the light and the dark theme. The app follows the
  system setting.

_(derived from [ADR-0011](adr/0011-ui-components-with-spartan-and-tailwind.md))_

## Typography

- **Display font:** Barlow Condensed, semibold, uppercase, widely tracked.
  Used only for the wordmark.
- **Text font:** not decided yet; until then the theme's default sans-serif
  applies.
- **Case:** sentence case for headings, labels and buttons ("Sign in", not
  "Sign In"). Only the wordmark is uppercase.
- **Hierarchy on a card:** title semibold at `text-2xl`; description
  `text-base` in `muted-foreground`; field labels medium weight; hints and
  helper text `text-sm` in `muted-foreground`.
- Use Tailwind's type scale; no arbitrary font sizes.

## Spacing and layout

- Use Tailwind's spacing scale; no arbitrary spacing values.
- Related elements sit closer together than unrelated ones: label and field
  closer than one field and the next.
- Layouts of individual screens are specified in
  [screens/](screens/README.md).

## Shape and elevation

- Corner radii come from the `--radius` token: cards one step rounder than
  controls (e.g. `rounded-xl` for cards, `rounded-lg` for inputs and
  buttons).
- Separate surfaces by color (`card` on `background`) and a subtle `border`,
  not by heavy shadows.

## Basic Components

- Build on the Spartan components in `shared/ui/helm/`. Change a variant
  there instead of overriding it at each use.
- **Buttons:** one primary (gold, filled) action per view; in forms it is
  full width. Secondary actions use the `outline` or `ghost` variant.
- **Inputs:** filled with a subtle `input` border. Focus shows the gold
  `ring`. Errors appear below the field in `destructive` and mark the field.
- **Password fields** have a show/hide toggle with an accessible label.
- **Cards** have a header with title and optional description.

## Iconography

- Not decided yet. Icons are outline style, used sparingly and never as the
  only carrier of meaning.

## Motion

- Short color, border and opacity transitions only; no decorative
  animation.
- Respect `prefers-reduced-motion`.

## Accessibility

- Meet WCAG AA contrast in both themes, including gold on dark surfaces.
- Every interactive element has a visible focus state.
- Every field has a visible label; icon-only buttons have an accessible
  name.

## Copy and tone

- English UI text: short, friendly, with a light hobby flavour; collection
  terms like "hoard" are welcome where they stay clear.
- Say what to do, not what went wrong in technical terms ("Enter a name",
  not "Field is required").
- The exact texts of a screen live in its spec in [screens/](screens/README.md).

## Enforcement

Planned, not set up yet: ESLint with `eslint-plugin-better-tailwindcss`
checks Angular templates (`.html` and inline templates in `.ts`) and
reports

- classes Tailwind does not know (`no-unknown-classes`);
- arbitrary values such as `bg-[…]` (`no-restricted-classes`).

The generated components in `shared/ui/helm/` are excluded, because they
use arbitrary values from upstream.

## Open decisions

- Text font
- Icon set
- Token values for the gold accent and the light theme
