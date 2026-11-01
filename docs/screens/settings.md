# Screen: Settings

- **Route:** `/settings`
- **Domain:** `instance`
- **Related:** [Shell](shell.md), [Profile](profile.md)

## Purpose

The place for settings. There are none yet.

## Layout

Inside the [shell](shell.md), one content column from top to bottom: the
title, and below it the note in `muted-foreground`.

## Content

| Element | Text or content |
|---------|-----------------|
| Browser tab title | Settings · Greyhoarder |
| Title | Settings |
| Note | Nothing to set yet. |

## Behavior

- The entry "Settings" of the [shell](shell.md) opens this page.

## Test IDs

`settings-title`, `settings-empty` (ADR-0013).

## Open questions

- Whether settings belong to the instance or to each user; the domain may
  change with the first real setting.
