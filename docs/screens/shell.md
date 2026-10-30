# Screen: Shell

- **Route:** every route behind the login; not the [login](login.md) or
  the [setup](setup.md)
- **Domain:** app level (`apps/client/src/app/shell/`)
- **Use cases:** [Sign in and out](../use-cases/sign-in-and-out.md)
- **Related:** [Dashboard](dashboard.md),
  [ADR-0009](../adr/0009-sessions-with-redis.md)

## Purpose

The frame around every page of a signed-in user: the navigation between
the areas of the app, who is signed in, and signing out.

## Layout

On wide screens (`md` and up), a sidebar on the left on the `sidebar`
surface with a border to the page, the current page to its right. From top
to bottom in the sidebar:

1. Wordmark (logo and product name).
2. The main entries, stacked.
3. Settings and "Sign out", pushed to the bottom, in the style of the
   entries.
4. Below a border: the button that collapses or expands the sidebar, an
   icon only, on the right.
5. The user row: avatar with the first letter of the username, username
   and role.

The logo, the icons of the entries and the avatar share one vertical axis.

Collapsed, the sidebar keeps only the logo, the icons and the avatar, on
that axis in the middle of a narrow sidebar; the labels, the product name,
username and role are hidden. Collapsing and expanding is a quick
animation of the width.

On narrow screens the sidebar becomes a bar above the page: wordmark, then
all entries and "Sign out" in one row that scrolls sideways, then the user
row. It cannot be collapsed there.

## Content

| Element | Text or content |
|---------|-----------------|
| Main entries | Dashboard, Hoard, Workbench, Paints, Armies |
| Bottom entry | Settings |
| Role | Admin / Member |
| Sign-out entry | Sign out |
| Collapse button (accessible name) | Collapse navigation / Expand navigation |

Each entry has an outline icon before its label.

## States

| State | When | What the user sees |
|-------|------|--------------------|
| Current entry | Its page is open | Entry on the accent background, icon in gold |
| Not available yet | The entry's screen does not exist | Entry dimmed with a small lock after its label (collapsed: on the corner of its icon), not a link; its tooltip and screen readers say "{label}: not available yet" (currently all but Dashboard and Hoard) |
| Collapsed | Collapse button pressed (wide screens only) | Only icons; each entry shows its label as a tooltip; the sidebar stays collapsed until it is expanded or the page is reloaded |
| Signed out | "Sign out" pressed | The session ends and the user is taken to the [login](login.md) |

## Behavior

- The entries are a fixed list in the shell; an entry becomes a link once
  its screen exists.
- The current entry is marked for screen readers (`aria-current="page"`).

## Open questions

- Whether the sidebar opens as a drawer on narrow screens instead of the
  bar.
- Whether the collapsed state is remembered across reloads.
- Whether Paints and Armies stay in the list before they are in scope.
