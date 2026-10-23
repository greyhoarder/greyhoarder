# Screen: Navigation error

- **Route:** none; shown in place of any page whose navigation failed, with
  the address of that page left in the address bar
- **Domain:** app level
- **Related:** [Login](login.md), [Shell](shell.md)

## Purpose

Before a page opens, the app asks the server whether the setup is done and
who is signed in. When the server does not answer, or anything else stops
the page from opening, the user gets a clear message and a way to try
again instead of an empty screen.

## Layout

One centered column on the `background`, like the [login](login.md):

1. Wordmark (logo and product name).
2. The message, centered.
3. The primary button below it, as wide as its label.

There is no shell around it: without the server it is unknown who is
signed in.

## Content

| Element | Text or content |
|---------|-----------------|
| Message, server not reachable | Can't reach the server. Try again in a moment. |
| Message, any other failure | Something went wrong. Try again in a moment. |
| Button | Try again; while trying: Trying again… |

## States

| State | When | What the user sees |
|-------|------|--------------------|
| Server not reachable | The server gives no answer, or a proxy in front of it answers that it did not (502, 503, 504) | The server message |
| Other failure | Any other error while opening the page, e.g. its code failed to load | The general message |
| Trying again | After pressing the button | The button busy, as on the login |

## Behavior

- "Try again" repeats the navigation that failed. If it succeeds, the page
  opens; if it fails again, the screen stays.
- Reloading the browser tries the same address again.
- Any successful navigation, e.g. with the browser's back button, closes
  the screen.

## Accessibility

- The message is announced to screen readers.

## Test IDs

`navigation-error-message`, `navigation-error-retry` (ADR-0013).
