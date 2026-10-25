# Screen: Box

- **Route:** `/hoard/boxes/:id`
- **Domain:** `hoard`
- **Related:** [Hoard](hoard.md), [Domain: hoard](../domains/hoard.md),
  [Add box](add-box.md), [Mini](mini.md), [Shell](shell.md)

## Purpose

Everything about one box: what it was added from, how far its minis have
come, and the minis themselves. From here the user edits the minis of the
box the same way as in the hoard.

## Layout

Inside the [shell](shell.md), one content column over the full width beside
the sidebar, as wide as the hoard, from top to bottom:

1. A back link "Boxes" with a left chevron, leading to the Boxes tab of the
   hoard.
2. The header:
   - left, a 112 × 112 photo placeholder with rounded corners, muted with
     diagonal stripes and a box icon;
   - middle, stacked: the box name as the title, followed by the progress
     badge; the kit line in `muted-foreground`; a smaller line with the
     factions and the date, followed by the tags as small outlined badges;
   - right: "Take from the sprue" (primary), "Edit box" (outline) and the
     "⋮" button (outline, `size-10`) for the box menu. On narrow screens
     the buttons move below the middle column.
3. The progress card, on the card surface: the heading "Progress" with the
   percentage on its right; the progress bar; below it one tile per
   status in pipeline order (on the sprue, built, primed, painted, done),
   each with a colored dot, the status and its count, also 0. The tiles
   share the width in one row and wrap on narrow screens.
4. Two columns: the minis (wide) and the kit card (narrow) beside it. When
   the content is narrower than about 720 px, the kit card moves below the
   minis.

**Minis**: the heading "Minis" with their count, and on its right the link
"Show in hoard" with a right chevron. Below it the minis as cards, stacked
with a small gap, like the cards of the Minis tab of the
[hoard](hoard.md): a square photo placeholder; the name, followed by the
"Workbench" tag when the minis are on the workbench, and below it a line
with the parts (empty if there are none); the status badge; the count; the
"⋮" button for the row's menu. The box is left out, since every mini here
comes from it. A mini's factions are shown before its parts only when they
differ from the factions of the box. Alike minis share a row as in every
[list of minis](../domains/hoard.md#lists-of-minis).

**Kit card**, on the card surface, only for boxes added from a kit:

1. A small muted label; below it the kit's name with the year of its first
   release in muted regular weight, followed by the dashed "Not checked"
   badge for draft catalog kits; below that a muted line with
   manufacturer and product code.
2. A border, then a muted label and what the kit suggests, one row per
   slot as on the open kit card of [Add box](add-box.md#kit-card-open):
   the number of minis in a fixed column, the suggested names, and below
   them the parts as small muted chips, wrapping. Either-or kits show the
   either-or row first, as there.
3. A border, then a muted note that kits only suggest.

## Content

| Element | Text or content |
|---------|-----------------|
| Browser tab title | {box name} · Greyhoarder |
| Back link | Boxes |
| Title | {box name} |
| Progress badge | Untouched / Started / Done |
| Kit line | {kit name} · {product code, if any}; "No kit" for boxes without one |
| Meta line | {factions} · added {date} |
| Buttons | Take from the sprue · Edit box |
| Box menu button (accessible name) | More actions |
| Box menu | Show minis in hoard · Add a mini to this box · Delete box… |
| Progress heading | Progress |
| Progress percentage | {n}% |
| Status tiles | On the sprue / Built / Primed / Painted / Done, each with its count |
| Minis heading | Minis {count} |
| Hoard link | Show in hoard |
| Mini row | as on the Minis tab: {name}, Workbench, {parts}, status badge, ×{count} |
| Row menu (accessible name) | More actions |
| Kit card label | Added from the kit |
| Kit name | {name} · {year}, as on [Add box](add-box.md#content) |
| Draft badge | Not checked |
| Release line | {manufacturer} · {product code}, leaving out the code when the kit has none |
| Suggestions label | The kit suggests |
| Slot row | {count}× · the suggested names joined with " or " · the parts |
| Kit note | Kits only suggest. Changing the kit never changes this box. |
| Not found | This box isn't in your hoard. |
| Load failed | Can't load this box right now. Try again in a moment. |
| Kit failed | Can't load the kit right now. Try again in a moment. |
| Kit missing | The catalog no longer has this version of the kit. |

## States

| State | When | What the user sees |
|-------|------|--------------------|
| Loading | The box is loaded | The back link; skeletons in the shape of the header, the progress card and three mini cards |
| Box | The box is loaded | Header, progress, minis and, for boxes from a kit, the kit card |
| Without kit | The box was not added from a kit | "No kit" as the kit line; no kit card, the minis take the full width |
| All on the sprue | Every mini of the box is on the sprue | The progress badge "Untouched", 0%, an empty bar |
| Nothing left on the sprue | No mini of the box is on the sprue | "Take from the sprue" is not shown |
| Not found | No box with this id in the user's hoard, also one of another user | The not-found message below the back link |
| Load failed | The server does not answer | The load-failed message in `destructive` below the back link, announced to screen readers |
| Kit failed | The server does not answer for the kit | The kit-failed message in muted text in place of the kit card |
| Kit missing | The catalog has no such version of the kit | The kit-missing message in muted text in place of the kit card |

## Behavior

- A click on a box in the Boxes tab of the [hoard](hoard.md), as card or
  table line and outside selection mode, opens this screen. The back link
  and the browser's back button return to the Boxes tab with its search,
  filters and view as they were.
- Progress, badge, percentage, bar and tiles follow the
  [domain rule](../domains/hoard.md#boxes-and-kits) and the progress bar of
  the [hoard](hoard.md#behavior): derived from the minis, never stored,
  minis on the sprue are the empty background of the bar.
- The minis are sorted by status, from done back to on the sprue, then by
  name.
- A click on a mini opens [Mini](mini.md) for its row, as a click on a row
  of the Minis tab does. After a change, the minis, the progress and the
  tiles show the new state.
- The row menu offers the same as on the Minis tab.
- "Show in hoard" and "Show minis in hoard" lead to the Minis tab of the
  hoard with this box ticked in the "Box" filter.
- The kit card shows the kit as it was when the box was added: the version
  the box records. A newer version of a catalog kit never changes it.
- "Take from the sprue", "Edit box", "Add a mini to this box" and "Delete
  box…" have no function yet.

## Accessibility

- The box menu button has `aria-haspopup="menu"` and `aria-expanded`.
- The progress bar is an image named after the counts per status past the
  sprue, as in the hoard ("1 built, 4 primed, 1 painted").
- Each mini card is a button named after the mini; the count is announced
  as "{count} minis", "1 mini".
- The not-found and load-failed messages are announced to screen readers.

## Test IDs

`box-back`, `box-name`, `box-progress-badge`, `box-kit-line`, `box-meta`,
`box-tag`, `box-take`, `box-edit`, `box-menu`, `box-show-minis`,
`box-add-mini`, `box-delete`, `box-percent`, `box-progress`, `box-status`,
`box-mini`, `box-mini-menu`, `box-show-in-hoard`, `box-kit`,
`box-kit-draft`, `box-kit-slot`, `box-kit-error`, `box-kit-missing`, `box-loading`, `box-not-found`, `box-error` (ADR-0013).

## Open questions

- What "Take from the sprue" asks, and what "Edit box" edits (name,
  factions, tags, date).
- Whether the kit card should say when the catalog has a newer version of
  the kit.
- Photos in place of the placeholder.
