# Screen: Login

- **Route:** `/login`; `/` leads here while signed out, once the
  [setup](setup.md) is done
- **Domain:** `auth`
- **Related:** [ADR-0007](../adr/0007-local-user-accounts.md),
  [ADR-0009](../adr/0009-sessions-with-redis.md)

## Purpose

Members and administrators sign in to their own collection. It is the only
screen a signed-out user can reach, apart from the initial setup.

## Layout

One centered column on the `background`, from top to bottom:

1. Wordmark (logo and product name), centered above the card.
2. A narrow card (`max-w-sm` to `max-w-md`) with generous padding, holding:
   1. the card header with title and description;
   2. the username field, then the password field with a show/hide toggle,
      stacked with one consistent gap;
   3. the "keep me signed in" checkbox with its label on the same line;
   4. the primary button over the full card width;
   5. the hint, centered below the button in `muted-foreground`.

The fields and the button are taller than the compact default and share one
height.

## Content

| Element | Text or content |
|---------|-----------------|
| Browser tab title | Sign in · Greyhoarder |
| Card title | Sign in |
| Card description | Welcome back to your hoard. |
| Username label | Username |
| Password label | Password |
| Password toggle (accessible name) | Show password / Hide password |
| Checkbox label | Keep me signed in on this device |
| Primary button | Sign in |
| Hint | Forgot your password? Ask your administrator. |

## States

| State | When | What the user sees |
|-------|------|--------------------|
| Initial | Screen opens | Empty fields, checkbox not ticked, no errors, focus in the username field |
| Missing input | Sent with an empty field | "Enter your username." or "Enter your password." below that field; focus moves to the first field with an error |
| Signing in | Request is running | Button shows that it is busy and cannot be pressed again |
| Wrong credentials | Unknown username or wrong password | One message for both cases: "Username or password is incorrect." |
| Too many attempts | Login is rate-limited | A message that sign-in is paused for a moment |
| Signed in | Request succeeded | The user is taken to the app |

## Behavior

- Enter in either field sends the form.
- The fields support password managers (`username` and `current-password`
  autocomplete).
- The toggle switches the password between hidden and visible and does not
  send the form.
- "Keep me signed in" is off by default. Unticked, the session ends when the
  browser is closed. Ticked, it survives closing the browser. In both cases
  the inactivity and maximum lifetime limits of ADR-0009 still apply.
- There is no registration and no email-based password reset (ADR-0007).

## Accessibility

- Error and status messages are announced to screen readers.
- The toggle states whether the password is currently visible.

## Open questions

- Where the user lands after signing in (no collection screen exists yet).
- Exact text for "Too many attempts".
- Whether the username stays and the password is cleared after wrong
  credentials.
- How the server implements "keep me signed in" (session cookie versus a
  cookie with an expiry). ADR-0009 does not cover it yet; it is decided
  together with the auth backend.
- Reference images for the light and the dark theme.
