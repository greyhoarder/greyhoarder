# Screen: Mini

- **Route:** `/hoard/minis/:id`
- **Domain:** `hoard`
- **Related:** [Hoard](hoard.md), [Box](box.md),
  [Domain: hoard](../domains/hoard.md),
  [ADR-0019](../adr/0019-hobby-data-model.md), [Shell](shell.md)

## Purpose

Everything about one mini, or one row of alike minis: what it was built
as, which parts it carries, where it stands in the pipeline and whether
it is on the workbench. While the minis are on the sprue, the screen is
where they are built: the user picks a name and parts and builds one or
more of them at once.

## Layout

Inside the [shell](shell.md), one content column over the full width beside
the sidebar, as wide as the hoard. Below the status, the column splits like
on [Box](box.md): the sections on the left, the box card in a side column
on the right; on narrow content widths the box card moves below them.

1. A back link "Hoard" with a left chevron; on the right of the same line
   the save note in small `muted-foreground` text.
2. The header:
   - left, a 112 × 112 photo placeholder with rounded corners, muted with
     diagonal stripes, a camera icon and "Add photo";
   - middle, stacked: the name as the title, followed by the status
     badge; below it the factions as chips (an own faction followed by a
     muted "· own") and a dashed chip "+ Faction";
   - right: the workbench toggle (outline, `h-10`, a brush icon) and the
     "⋮" button (outline, `size-10`) for the mini menu.

   On narrow screens the middle column wraps below the photo and the
   buttons move below it.
3. The status, without a card: the label "Status" in small
   `muted-foreground` text and on its right the share as a percentage, as
   on [Box](box.md); below it a thin bar of four segments, one per status
   past the sprue, and below each segment, right-aligned, its status. The
   segments up to the current status take the color of the current status
   (as on its badge), the others are `muted`; on the sprue none is
   colored. The bar only shows the status.
4. The "Build as" section: the heading "Build as" and on its right, muted,
   "Suggested by {box name}"; below it one tile per suggested name, each
   with the name and a small line "{n} left in this box", and last a
   dashed tile "Your own name" with an input. The chosen tile has the
   `muted` surface and a `muted-foreground` border; a typed own name turns
   its tile solid and chooses it.
5. The "Parts" section: the heading "Parts" with their count in muted text,
   and on its right a muted hint; below it one tile per part, each with
   the part's name, a "×" button to remove it and below the name the
   swappable toggle, a small rounded button reading "Glued" with a droplet
   icon or "Swappable" with a magnet icon (outlined and `muted` surface
   when swappable).
   The last tile is the dashed "Add a part" tile with a plus. It opens the
   part picker below the tiles, separated by a border:
   - a filter input with a search icon;
   - the group "From the kit · {box name}": the parts the box's kit offers
     the minis' slot, as chips "+ {part}", in the kit's order;
   - the group "Your parts": the other terms of the user's vocabulary as
     the same chips, by name;
   - while filtering, the group "{faction} range": parts of the catalog
     kits of the minis' range, as the same chips;
   - a chip matching through an alias shows a muted "also {alias}" after
     the name;
   - without an exact match of the filter text, after a border, the group
     "New part": a chip "Create “{text}”" with a plus, a dashed
     `muted-foreground` border and the `muted` surface, set apart from the
     outlined chips above, and the hint "Becomes a part of your own,
     usable on every mini." next to it.

   All chips wrap; there is no dropdown and no scrolling list of its own.
   While open, the tile reads "Close" with a solid border and its plus
   turned into a ×.
6. The "Notes" section: the heading "Notes" and a text area.

   Build as, Parts and Notes have no card of their own.
7. In the side column, the box card (card surface, border): the label
   "From the box"; the box's photo placeholder (48 × 48, muted with
   stripes) with the kit's name and year and below it the manufacturer and
   product code, the whole line a link with a right chevron; below it
   "Added {date} · box at {percent}%". After a border, "The kit suggests
   for a {name}" with the parts the kit's slots for the name to build
   offer as small muted chips; after another border the muted note "Kits
   only suggest. What you add here counts." Without a kit the card shows
   the box's name and neither the parts nor the note; a mini without a
   box shows a card reading "Without box".
8. Only while the minis are on the sprue: the build bar, sticking to the
   bottom of the screen while scrolling, on the card surface with a
   border and without a shadow: the summary on the left; on the right the count stepper
   "− {n} + of {N}" (only for rows of more than one mini), the checkbox
   "Put on workbench" and the primary button.

Tiles share the width in one row and wrap on narrow screens; header and
build bar stack. Gold appears only on the build button, the done badge and
the bar of a painted or done mini.

Names of either-or kits, and of the boxes and minis made from them, show
their outcomes apart by a muted "or" ("Lootas or Burna Boyz") wherever the
screen shows them as names; in plain text, such as the browser tab or a
muted line, the "or" is plain.

## Content

| Element | Text or content |
|---------|-----------------|
| Browser tab title | {name} · Greyhoarder |
| Back link | Hoard |
| Save note | On the sprue: Nothing is saved until you build it · otherwise: Saving… / All changes saved |
| Photo placeholder | Add photo |
| Title | The name; on the sprue the chosen suggestion or the typed own name, and the mini's name until one is chosen |
| Status badge | On the sprue / Built / Primed / Painted / Done |
| Faction chip | {faction}; own factions: {faction} · own |
| Add faction chip | + Faction |
| Workbench toggle | On the workbench / Put on workbench |
| Mini menu button (accessible name) | More actions |
| Mini menu | Duplicate mini · Change origin box… · Delete mini… |
| Status label | Status; on its right {percent}% (sprue 0, built 25, primed 50, painted 75, done 100) |
| Status bar labels | Built · Primed · Painted · Done |
| Build as heading | Build as |
| Suggestions note | Suggested by {box name} |
| Name tile | {name}; below: {n} left in this box · None left in this box · Only {n} left in this box |
| Own name tile | Your own name; placeholder: e.g. Tankbusta |
| Parts heading | Parts {count} |
| Parts hint | On the sprue, before parts were changed: Preselected for {name} — change what you actually built · otherwise: What is physically on this mini |
| Part tile | {part}; remove button (accessible name): Remove {part} |
| Swappable toggle | Glued (droplet icon) / Swappable (magnet icon) |
| Add part tile | Add a part; while open: Close |
| Part filter placeholder | Filter, or type a new part |
| Kit group | From the kit · {box name} |
| Vocabulary group | Your parts |
| Range group | {first faction of the minis} range, e.g. Orks range |
| New part group | New part |
| Part chip | + {part}; through an alias: + {part} also {alias} |
| Create chip | Create “{text}”, with a plus icon |
| Create hint | Becomes a part of your own, usable on every mini. |
| Notes heading | Notes |
| Notes placeholder | Kitbash sources, loadout ideas, what is still to do |
| Box card label | From the box |
| Box card link | {kit name} · {year}, below: {manufacturer} · {product code}; without a kit: {box name} |
| Box card progress | Added {date} · box at {percent}% |
| Box card parts | The kit suggests for a {name} |
| Box card note | Kits only suggest. What you add here counts. |
| Without box | Without box |
| Build summary | {n} of {N} alike minis becomes {name} with {parts}. — several: become; parts joined with ", ", a swappable one followed by " (swappable)"; without parts: …becomes {name}, no parts. For a single mini: This mini becomes {name} with {parts}. Before a name is chosen: Choose what to build. |
| Count stepper | − {n} + of {N}; buttons: One fewer, One more |
| Build checkbox | Put on workbench |
| Build button | Build mini · Build {n} minis; disabled until a name is chosen |
| Not found | This mini isn't in your hoard. |
| Load failed | Can't load this mini right now. Try again in a moment. |
| Save failed | Can't save right now. Try again in a moment. |

## States

| State | When | What the user sees |
|-------|------|--------------------|
| Loading | The hoard is loaded | The back link; skeletons in the shape of the header and the status |
| On the sprue | The minis of the row are on the sprue | The status "On the sprue", "Build as" with the mini's name chosen when it is a suggestion, else nothing chosen, parts preselected (see Behavior), the build bar; the save note says nothing is saved |
| Building | "Build mini" pressed | The button shows the busy stripes and "Building…"; the bar stays until the server answers |
| Built | The minis are past the sprue | No build bar; every change is saved at once, the save note says so |
| Without kit | The mini has no box, or its box no kit, or the kit can't be loaded | No suggestion tiles, only "Your own name"; no "Suggested by"; the part picker has no kit group; the box card without kit, parts and note |
| Too many | The chosen count is larger than what is left for the chosen name | The name tile's line in `destructive`: Only {n} left in this box; nothing is blocked |
| Picker open | "Add a part" pressed | The part picker below the part tiles |
| Not found | No mini with this id in the user's hoard, also one of another user | The not-found message below the back link |
| Load failed | The server does not answer | The load-failed message in `destructive` below the back link, announced to screen readers |
| Save failed | A change or the build is not saved | The save-failed message in `destructive` in place of the save note, announced to screen readers; what was entered stays |

## Behavior

- A click on a row of the Minis tab of the [hoard](hoard.md), as card or
  table line and outside selection mode, or on a mini of a
  [box](box.md) opens this screen with the row's first mini in the
  address. The screen is about the whole row: every mini of the hoard that
  is alike to that mini (same name, factions, status, parts, box and
  workbench place, see [Lists of minis](../domains/hoard.md#lists-of-minis)).
- The back link leads to the Minis tab of the hoard; the browser's back
  button returns to where the screen was opened from. Search, filters and
  view of the hoard stay as they were.
- **Status:** the bar and the percentage only show the status; there is no
  control to change it yet.
- **Build as:** the tiles offer what the minis' slot can be built as: the
  names of the slots a box of the kit put minis of their sprue name on the
  sprue from, kits in it included, each once in the kit's order. A Boy of
  a Battleforce gets the names of the Boy slot, not those of the Stompa or
  the Trukk; the undecided minis of Lootas and Burna Boyz get Loota and
  Burna Boy, not Spanner. When the kit put no minis of that sprue name on
  the sprue, every name of the kit is offered.
  For each name, "{n} left in this box" counts the minis the box's kit
  provides for it (in the variant that provides the most) minus the minis
  of this box that already use it up: those past the sprue that were built
  as it, and those built under an own name that had it on the sprue. With none
  left, the line reads "None left in this box" in `destructive`. When the
  chosen count is larger than what is left, the chosen tile's line
  becomes "Only {n} left in this box" in `destructive`. Nothing is
  blocked: kits only suggest.
- Typing an own name chooses its tile; choosing a suggestion empties it.
  A mini built under an own name uses up the suggestion it had on the
  sprue.
- **Parts preselected on the sprue:** choosing a name preselects the parts
  of the mini of the hoard most recently built as that name; without one,
  the part the kit's slots for that name offer when they offer exactly one
  (Loota: Deffgun), else no parts. Once the user has changed the parts,
  choosing another name keeps them. The parts hint says "Preselected for
  {name}" only while something is preselected.
- **Parts:** "×" removes a part; the swappable toggle switches between
  glued and swappable. The part picker offers the parts the box's kit
  offers the minis' slot first (the same slots as for Build as), then the
  user's vocabulary, and while the filter has text the
  parts of the minis' range, at most 20: every part the catalog kits
  offer that are listed for one of the minis' factions or a faction it is
  part of, up the whole chain (a Dark Angels mini gets Space Marines
  parts), unless offered above. It leaves out the parts the minis already
  carry. The filter keeps the chips whose name or an alias
  contains the text, ignoring case. A click on a chip adds the part as
  glued and empties the filter; the picker stays open. "Create" adds a new
  term to the user's vocabulary and the part to the minis. A part from the
  kit or the range becomes a term of the user's vocabulary when it is first used
  ([domain](../domains/hoard.md#parts)).
- Opening and closing the picker unfolds it by animating
  `grid-template-rows` from `0fr` to `1fr` in about 260 ms; with
  `prefers-reduced-motion` it opens without animation.
- **On the sprue** nothing is saved until "Build mini". The build bar's
  summary follows every choice. The count stepper goes from 1 to the
  number of minis in the row; "Put on workbench" is ticked at first, and
  the header's workbench toggle shows the same choice. "Build mini" sets
  that many minis of the row, the one in the address first, to built,
  with the chosen name, parts, notes and workbench place; the rest of the
  row stays on the sprue unchanged. Afterwards the screen shows the built minis.
- **Past the sprue** every change is saved at once: name, parts,
  workbench and the faction removals as soon as they are made, the notes
  when the text area loses focus. Each change applies to every mini of the
  row, so they stay alike.
- A faction chip's "×" removes the faction from the minis.
- The box card's link opens [Box](box.md). Its parts follow the name to
  build: the chosen or typed one, else the minis' name; without parts for
  it the part line is left out.
- "+ Faction", "Add photo" and the mini menu's items have no function yet.
- The screen has no field for "counts as"; the data model keeps it.

## Accessibility

- The name tiles and the swappable toggles are toggle buttons with
  `aria-pressed`; the name tiles are a group labelled by their heading.
- The status bar is hidden from screen readers; the status badge names the
  status.
- The swappable toggle is named "Swappable {part}" for screen readers,
  whatever it reads; the workbench toggle is named "On the workbench" and
  pressed while the minis are on it.
- "Add a part" has `aria-expanded` and `aria-controls` for the picker;
  the closed picker is hidden from screen readers.
- The mini menu button has `aria-haspopup="menu"` and `aria-expanded`.
- The save note and the count are live regions; the not-found, load-failed
  and save-failed messages are announced.
- The photo placeholder is a button named "Add a photo"; the text area is
  labelled by "Notes".

## Test IDs

`mini-back`, `mini-save-note`, `mini-name`, `mini-status-badge`,
`mini-faction`, `mini-add-faction`, `mini-workbench`,
`mini-menu`, `mini-duplicate`, `mini-change-origin`, `mini-delete`,
`mini-percent`, `mini-build-as`, `mini-build-as-name`, `mini-name-left`
(with `data-warning` while it warns), `mini-own-name`,
`mini-part`, `mini-part-name`, `mini-part-remove`, `mini-part-swappable`,
`mini-add-part`, `mini-part-filter`, `mini-part-group` (with `data-group`:
`kit`, `vocabulary`, `range` or `create`), `mini-part-group-name`,
`mini-part-option`, `mini-part-create`, `mini-notes`, `mini-box`,
`mini-origin` (the box card's link, or "Without box"), `mini-box-added`,
`mini-box-part`,
`mini-build-bar`, `mini-build-summary`, `mini-build-less`,
`mini-build-count`, `mini-build-more`, `mini-build-workbench`,
`mini-build`, `mini-loading`, `mini-not-found`, `mini-error`,
`mini-save-error` (ADR-0013).

## Open questions

- What adding a faction offers; own factions have no data model yet.
- Photos: how many per mini, and where files are stored.
- How the status is changed past the sprue, and set back; the bar only
  shows it.
- Minis on the sprue will soon be handled apart from built minis in the
  data model ([domain](../domains/hoard.md#open-questions)); building on
  this screen changes with it.
- What the screen asks when a mini becomes primed, painted or done.
- What the mini menu's items do.
