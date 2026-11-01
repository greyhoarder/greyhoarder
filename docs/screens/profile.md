# Screen: Profile

- **Route:** `/profile`
- **Domain:** `auth`
- **Related:** [Shell](shell.md), [Settings](settings.md),
  [ADR-0007](../adr/0007-local-user-accounts.md)

## Purpose

Who is signed in. The page only shows the account; nothing can be changed
here yet.

## Layout

Inside the [shell](shell.md), one content column from top to bottom:

1. The title.
2. The avatar with the first letter of the username, as in the user row of
   the [shell](shell.md#layout); beside it the username and below that the
   role in `muted-foreground`.
3. The note in `muted-foreground`.

## Content

| Element | Text or content |
|---------|-----------------|
| Browser tab title | Profile · Greyhoarder |
| Title | Profile |
| Role | Admin / Member |
| Note | Details come later. |

## Behavior

- The user row of the [shell](shell.md) opens this page.

## Test IDs

`profile-title`, `profile-username`, `profile-role` (ADR-0013).
