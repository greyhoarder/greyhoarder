# Screen: Shell

- **Route:** every route behind the login; not the [login](login.md) or
  the [setup](setup.md)
- **Domain:** app level (`apps/client/src/app/shell/`)
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
3. Settings, pushed to the bottom.
4. Below a border: avatar with the first letter of the username, username
   and role, and the sign-out button on the right.

On narrow screens the sidebar becomes a bar above the page: wordmark, then
all entries in one row that scrolls sideways, then the user row with the
sign-out button.

## Content

| Element | Text or content |
|---------|-----------------|
| Main entries | Dashboard, Hoard, Workbench, Paints, Armies |
| Bottom entry | Settings |
| Role | Admin / Member |
| Sign-out button (accessible name) | Sign out |

Each entry has an outline icon before its label.

## States

| State | When | What the user sees |
|-------|------|--------------------|
| Current entry | Its page is open | Entry on the accent background, icon in gold |
| Not available yet | The entry's screen does not exist | Entry dimmed, not a link (currently all but Dashboard and Hoard) |
| Signed out | Sign-out button pressed | The session ends and the user is taken to the [login](login.md) |

## Behavior

- The entries are a fixed list in the shell; an entry becomes a link once
  its screen exists.
- The current entry is marked for screen readers (`aria-current="page"`).

## Open questions

- Whether the sidebar collapses or opens as a drawer on narrow screens
  instead of the bar.
- Whether Paints and Armies stay in the list before they are in scope.
