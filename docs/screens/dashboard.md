# Screen: Dashboard

- **Route:** `/dashboard`; `/` leads here while signed in
- **Domain:** `dashboard`
- **Related:** [Login](login.md), [Shell](shell.md)

## Purpose

The start page after signing in. For now it welcomes the user and lays
out the areas that will give an overview of their hoard.

## Layout

Inside the [shell](shell.md), one centered content column (`max-w-6xl`) on
the `background`, from top to bottom:

1. The greeting as the page heading.
2. The section "Activity".
3. The section "On the workbench".
4. The section "In the hoard".

Each section has its heading above its content. Until the content exists,
a section shows an empty area with a dashed border.

## Content

| Element | Text or content |
|---------|-----------------|
| Browser tab title | Dashboard · Greyhoarder |
| Heading | Welcome back, {username} |
| Section headings | Activity · On the workbench · In the hoard |

## States

| State | When | What the user sees |
|-------|------|--------------------|
| Signed in | Screen opens | The greeting with their username |
| Signed out | Screen is opened without a session | The user is taken to the [login](login.md) |

## Behavior

- Every navigation asks the server whether the session is still valid.

## Open questions

- The content of the three sections.
