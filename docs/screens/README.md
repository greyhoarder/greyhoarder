# Screens

One file per screen: what it is for, what it shows, its states and how it
behaves. Read the file of the screen you build or change; the general look
and feel is in [design-system.md](../design-system.md).

Screen specs describe the current target, not a decision record: they are
updated in place when the screen changes. Add new screens to the list
below.

| Screen | Route | Domain |
|--------|-------|--------|
| [Login](login.md) | `/login` | `auth` |
| [Setup](setup.md) | `/setup` | `auth` |
| [Dashboard](dashboard.md) | `/dashboard` | `dashboard` |
| [Hoard](hoard.md) | `/hoard/minis`, `/hoard/boxes` | `hoard` |
| [Box](box.md) | `/hoard/boxes/:id` | `hoard` |
| [Add box](add-box.md) | `/hoard/add/box` | `hoard` |
| [Shell](shell.md) | every route behind the login | app level |
| [Navigation error](navigation-error.md) | in place of any page that fails to open | app level |
