# Screen: Setup

- **Route:** `/setup`
- **Domain:** `auth`
- **Related:** [ADR-0007](../adr/0007-local-user-accounts.md),
  [Login](login.md)

## Purpose

On the first start of an instance, the person installing it creates the
first account, which becomes the administrator. There is no open
registration: this screen is the only way to create an account without
being an administrator, and only while no account exists.

## Layout

The same structure as the [Login](login.md) screen, one centered column on
the `background`, from top to bottom:

1. Wordmark (logo and product name), centered above the card.
2. A narrow card (`max-w-sm` to `max-w-md`) with generous padding, holding:
   1. the card header with title and description;
   2. the username field, the password field and the password confirmation
      field, each password field with a show/hide toggle, stacked with one
      consistent gap; a strength meter sits directly below the password
      field;
   3. the primary button over the full card width;
   4. the hint, centered below the button in `muted-foreground`.

The fields and the button are taller than the compact default and share one
height.

## Content

| Element | Text or content |
|---------|-----------------|
| Browser tab title | Set up · Greyhoarder |
| Card title | Set up your hoard |
| Card description | Create the administrator account for this instance. |
| Username label | Username |
| Password label | Password |
| Password confirmation label | Repeat password |
| Password toggles (accessible name) | Show password / Hide password |
| Strength meter levels | Too weak / Weak / Fair / Strong |
| Primary button | Create administrator |
| Primary button while busy | Creating administrator… |
| Hint | You can add more accounts later as administrator. |

## States

| State | When | What the user sees |
|-------|------|--------------------|
| Initial | Screen opens | Empty fields, no errors, focus in the username field |
| Missing input | Sent with an empty field | A message below each empty field; focus moves to the first field with an error |
| Passwords differ | Sent while the two passwords differ | A message below the confirmation field |
| Creating | Request is running | Button reads "Creating administrator…", shows the busy stripes and cannot be pressed again |
| Invalid input | The server rejects username or password | The server's message below the affected field |
| Server not reachable | The request gets no answer | "Can't reach the server. Try again in a moment." above the button |
| Already set up | An account exists, e.g. someone else finished the setup first | The user is taken to the login with a short notice |
| Created | Request succeeded | The new administrator is signed in and taken to the [dashboard](dashboard.md) |

## Behavior

- Enter in any field sends the form.
- The fields support password managers (`username` and `new-password`
  autocomplete).
- Each toggle switches its password field between hidden and visible and
  does not send the form.
- The strength meter appears as soon as a password is typed: four
  segments, "Too weak" in `destructive`, "Weak" and "Fair" in
  `muted-foreground`, "Strong" in `primary`. It is rated in the browser
  (zxcvbn with common, English and German dictionaries, the username counts
  as easy to guess) and only informs; it never blocks sending.
- The screen is only reachable while no account exists; otherwise `/setup`
  leads to the login. While no account exists, every other address leads
  here. Whether the setup is still needed comes from `GET /api/auth/setup`,
  asked on every navigation; the form is sent with `POST /api/auth/setup`.
- Usernames have 3 to 32 characters: letters `a–z` in either case, digits,
  dot, underscore and hyphen. Passwords have 1 to 256 characters and no
  other rules. Both rules live in `libs/domain/users`, so client and server
  check the same.
- The new account always gets the role `admin` (ADR-0007).

## Accessibility

- Error and status messages are announced to screen readers.
- The toggles state whether the password is currently visible.

## Test IDs

`setup-username`, `setup-password`, `setup-password-confirmation`,
`setup-submit`, `setup-failure` (ADR-0013).

## Open questions

- Reference images for the light and the dark theme.
