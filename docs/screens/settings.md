# Screen: Settings

- **Route:** `/settings/general`, `/settings/users`, `/settings/users/add`;
  `/settings` leads to the first
- **Domain:** app level (`shell/settings`), with its sections from
  `instance` and `auth`
- **Use cases:** [Add accounts](../use-cases/add-accounts.md),
  [Manage accounts](../use-cases/manage-accounts.md)
- **Related:** [Shell](shell.md), [Profile](profile.md)

## Purpose

What concerns the whole instance. What a user sets for themselves is on
[Profile](profile.md).

## Layout

Inside the [shell](shell.md), everything in the same place as on the
[hoard](hoard.md#layout): the title with a muted line below it, then a tab
bar: "General", and for administrators "Users". The
primary action of the open tab stands on the right of the title; "General"
has none, "Users" has "Add user".

- **General:** a muted note; there are no settings of the instance yet.
- **Users:** the field "Search users" in a row like the filter row of the
  [hoard](hoard.md#layout), then one card per
  account, stacked with a small gap, built like the group cards of
  [Box](box.md#layout):
  - Closed: the avatar, the name, below it the username and the last
    login; on the right
    the "Disabled" badge when disabled, the role as a pill and a chevron.
  - Opened, with a gold border and below an inner border, indented to the
    name: the details "Username", "Created" and "Last login" in columns;
    then "Role" (segmented) on the left and "Reset password…", "Disable" or
    "Enable" and "Delete…" (`destructive` text) on the right, all outline.
    "Reset password…" unfolds a field and "Set password" (primary) below.
  - While a change would leave no active administrator, its controls are
    disabled, with the last-administrator note below.
- **Add user** (`users/add`): a back link "Users", the heading, the fields
  "Username", "Role" (segmented, "Member" chosen at first) and "First
  password" with the strength meter, then "Cancel" (ghost) and "Add user"
  (primary).

## Content

| Element | Text or content |
|---------|-----------------|
| Browser tab titles | Settings · Greyhoarder; Users · Greyhoarder; Add user · Greyhoarder |
| Title | Settings |
| Summary | What concerns this whole instance |
| Tabs | General · Users |
| General note | Nothing to set yet. |
| Search placeholder | Search users |
| No users found | No users match "{query}". |
| Roles | Member · Admin |
| Account line (closed) | @{username} · then Last login today, {time}; Last login yesterday, {time}; Last login {date}, {time}; or Never signed in |
| Account details | Username @{username} · Created {date} · Last login Today, {time} · Yesterday, {time} · {date}, {time} · Never |
| Disabled badge | Disabled |
| Account controls | Role · Reset password… · Disable · Enable · Delete… · Set password |
| Password set | The password was set. All of {name}'s sessions ended. |
| Last-administrator note | This is the last active administrator. |
| Delete dialog | Delete {name} for good? |
| Delete dialog text | Their whole hoard is deleted with them. This can't be undone. |
| Delete dialog buttons | Cancel · Delete account |
| Change failed | Can't change this account right now. Try again in a moment. |
| Add errors | Enter a username. · Use 3 to 32 characters. · Use only letters, digits, dots, underscores and hyphens. · This username is taken. · Enter a password. · Can't add the user right now. Try again in a moment. |
| Load failed | Can't load the users right now. Try again in a moment. |

## Behavior

- The entry "Settings" of the [shell](shell.md) opens this page.
- Members don't see "Users"; its addresses lead them to "General".
- After adding a user the page leads back to "Users".
- All cards are closed at first; a click on a card's header opens or
  closes it. Changes are saved at once; deleting asks first.
- Administrators can change their own account too, as long as an active
  administrator remains; deleting it signs them out.

## Test IDs

`settings-title`, `settings-summary`, `settings-empty`, `settings-tab-general`,
`settings-tab-users`, `users-add`, `users-search`, `users-no-results`, `users-row`, `users-toggle`,
`users-disabled`, `users-created`, `users-last-login`, `users-role`,
`users-reset-password`, `users-new-password`, `users-set-password`, `users-toggle-access`,
`users-delete`, `users-last-admin`, `users-message`, `users-change-error`,
`users-delete-dialog`, `users-delete-cancel`, `users-delete-confirm`,
`users-delete-error`, `users-error`,
`add-user-back`, `add-user-username`, `add-user-role`, `add-user-password`,
`add-user-cancel`, `add-user-submit`, `add-user-error` (ADR-0013).

## Open questions

- Which settings the instance gets.
