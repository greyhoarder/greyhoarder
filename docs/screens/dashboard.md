# Screen: Dashboard

- **Route:** `/dashboard`; `/` leads here while signed in
- **Domain:** `dashboard`
- **Related:** [Login](login.md), [Shell](shell.md), [Hoard](hoard.md),
  [Domain: hoard](../domains/hoard.md)

## Purpose

The start page after signing in: a greeting and an overview of the hoard by
faction; activity and the workbench follow later.

## Layout

Inside the [shell](shell.md), one content column over the full width beside
the sidebar, on the `background`, from top to bottom:

1. The greeting as the page heading.
2. The section "Activity".
3. The section "On the workbench".
4. The section "In the hoard".

Each section has its heading above its content. Until the content exists,
a section shows an empty area with a dashed border. For "In the hoard",
that is the case while the hoard has no minis; the area then holds the
empty message.

### In the hoard

Next to the heading the summary in muted text; on the right the legend,
one dot in the color of its status badge per status. Below, the faction
cards in a grid: one column, two from `sm`, three from `lg`.

Each card is a bordered card on the card surface with rounded corners:

- top left, stacked: the game system small and muted, the faction's name in
  semibold, and the minis line, small and muted;
- top right: the share of painted minis, large;
- below: one small square dot per mini, wrapping, in the order done,
  painted, primed, built, sprue.

## Content

| Element | Text or content |
|---------|-----------------|
| Browser tab title | Dashboard · Greyhoarder |
| Heading | Welcome back, {username} |
| Section headings | Activity · On the workbench · In the hoard |
| Hoard summary | {n} minis · {p} painted, "1 mini" |
| Legend | On the sprue · Built · Primed · Painted · Done |
| Game system | The name of the faction's game system, e.g. "Warhammer 40,000" |
| Faction | The faction's name; "No faction" for minis without one |
| Minis line | {n} minis · {p} painted, "1 mini" |
| Share painted | {x} %, e.g. "36 %" |
| Hoard empty | No minis yet. Add a box and its minis appear here. |
| Hoard failed | Can't load your hoard right now. Try again in a moment. |

## States

| State | When | What the user sees |
|-------|------|--------------------|
| Signed in | Screen opens | The greeting with their username |
| Signed out | Screen is opened without a session | The user is taken to the [login](login.md) |
| Hoard loading | The hoard is loaded for the first time | A skeleton line in place of the summary, three placeholder cards |
| Hoard empty | The hoard has no minis | The empty area with a dashed border and the empty message in it, in place of the cards; no summary and no legend |
| Hoard failed | The server does not deliver the hoard | The failed message in `destructive`, announced to screen readers |

## Behavior

- Every navigation asks the server whether the session is still valid.
- Gone minis ([domain](../domains/hoard.md#leaving-the-hoard)) are not
  counted.
- A mini counts under each of its factions and under every faction they
  are part of, up the whole chain: a Dark Angels mini counts for the
  Space Marines as well. The summary counts it once.
  Minis without a faction count under "No faction".
- The cards are sorted by their number of minis, most first, then by name;
  "No faction" always comes last.
- "Painted" counts painted and done minis. The share is the painted minis
  divided by all minis of the card, rounded.
- The dots use the colors of the status badges (see [hoard](hoard.md)).
- A faction that is a whole game system shows no game system above its
  name; "No faction" shows none either.
- The cards are not links yet.

## Accessibility

- The dots of a card are one image for screen readers, labeled with the
  count of each status, e.g. "5 on the sprue, 3 built, 0 primed, 1 painted,
  1 done".

## Test IDs

`dashboard-greeting`, `dashboard-activity`, `dashboard-workbench`,
`dashboard-hoard-summary`, `dashboard-hoard-loading`,
`dashboard-hoard-empty`, `dashboard-hoard-error`, `dashboard-hoard-faction`,
`dashboard-hoard-faction-system`, `dashboard-hoard-faction-name`,
`dashboard-hoard-faction-count`, `dashboard-hoard-faction-percent`,
`dashboard-hoard-faction-dots` (ADR-0013).

## Open questions

- The content of "Activity" and "On the workbench". The workbench holds
  the minis the user put there, not every mini past the sprue.
- Where own factions get their game system from once they exist.
- Whether a card leads to the hoard filtered by its faction.
