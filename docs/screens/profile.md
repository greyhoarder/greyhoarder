# Screen: Profile

- **Route:** `/profile`, `/profile/password`
- **Domain:** `auth`
- **Use cases:** [Edit your profile](../use-cases/edit-your-profile.md),
  [Change one's own password](../use-cases/change-password.md),
  [Choose the appearance](../use-cases/choose-appearance.md)
- **Related:** [Shell](shell.md), [Settings](settings.md),
  [ADR-0007](../adr/0007-local-user-accounts.md)

## Purpose

Everything a user sets for themselves: how they appear, how the app looks,
and the security of their account. What concerns the whole instance is in
[Settings](settings.md).

## Layout

Inside the [shell](shell.md), the title, then the sections, each a small
heading above one card whose rows are split by borders. From 896 px of
content width two sections stand side by side at the same height; below
that they stack, at most 672 px wide.

1. **Account:** the avatar, the name and the role, on the right "Change"
   (outline) and, with a picture, "Remove" (ghost); then the display name
   with its hint and field.
2. **Appearance:** the theme as three tiles with a small preview, the
   chosen one with a gold border; then the language in a select.
3. **Security:** "Password" with "Change password" (outline), which opens
   its own page; then "Other devices" with its hint and "Sign out other
   devices" (outline, `destructive` text).

`/profile/password` has a back link "Profile", the title, the fields
"Current password", "New password" with the strength meter and "Repeat
new password", and "Cancel" (ghost) and "Change password" (primary).

## Content

| Element | Text or content |
|---------|-----------------|
| Browser tab titles | Profile · Greyhoarder; Change password · Greyhoarder |
| Title | Profile |
| Section headings | Account · Appearance · Security |
| Role | Admin / Member |
| Picture buttons | Change · Remove |
| Picture hints | Choose an image. · That image is too large. |
| Display name | Display name; hint: Your username stays @{username}. |
| Display name error | Use at most 50 characters. |
| Theme | Theme: System · Light · Dark |
| Language | Language: English · Deutsch |
| Password row | Password · Change password |
| Other devices | Other devices; hint: Signs you out everywhere except here. · Sign out other devices |
| Signed out others | Other devices are signed out. |
| Save failed | Can't save right now. Try again in a moment. |
| Password fields | Current password · New password · Repeat new password |
| Password errors | Enter your current password. · The current password is wrong. · Enter a new password. · The passwords do not match. · Too many attempts. Try again in a moment. · Can't change the password right now. Try again in a moment. |
| Password changed (on the profile) | Your password was changed. |

## Behavior

- The user row of the [shell](shell.md) opens this page.
- The display name is saved when the field loses the focus; a theme, a
  language and a picture when chosen. Failing, the stored value is shown
  again with the save-failed message.
- A chosen picture is cropped to a square and made 256 × 256 px in the
  browser, then uploaded.
- The theme is kept in this browser and applied at once; the language with
  the account, without any effect yet.
- After changing the password the page leads back here and says so.

## Accessibility

- The themes are a radio group named "Theme".
- Messages are announced to screen readers.

## Test IDs

`profile-title`, `profile-username`, `profile-role`, `profile-avatar`,
`profile-avatar-file`, `profile-avatar-remove`, `profile-avatar-error`,
`profile-display-name`, `profile-display-name-error`, `profile-theme`,
`profile-language`, `profile-change-password`, `profile-sign-out-others`,
`profile-message`, `profile-error`, `change-password-back`,
`change-password-current`, `change-password-new`, `change-password-repeat`,
`change-password-cancel`, `change-password-submit`,
`change-password-error` (ADR-0013).
