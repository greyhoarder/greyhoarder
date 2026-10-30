# Screen: Mini

- **Route:** `/hoard/minis/:id`
- **Domain:** `hoard`
- **Related:** [Hoard](hoard.md), [Box](box.md),
  [Domain: hoard](../domains/hoard.md),
  [ADR-0019](../adr/0019-hobby-data-model.md), [Shell](shell.md)

## Purpose

Everything about one mini: what it was built as, which parts it carries,
where it stands in the pipeline and whether it is on the workbench. The
screen always shows a single mini; acting on several at once happens on
their [box](box.md). A mini still on the sprue can be built here on its
own: the user picks a name and parts and builds it.

## Layout

Inside the [shell](shell.md), one content column over the full width beside
the sidebar, as wide as the hoard. Below the status, the column splits like
on [Box](box.md): the sections on the left, the box card in a side column
on the right; on narrow content widths the box card moves below them.

1. A back link "Hoard", or "Box" when opened from a box, with a left
   chevron; on the right of the same line
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

   While the leave panel is open, it unfolds below the header, on the card
   surface with a border, like the part picker: the heading "Leave the
   hoard"; the reasons as a row of toggle tiles "Sold · Given away ·
   Stripped for parts · Lost or broken"; a date field (today at first);
   for "Stripped for parts" the field "Parts went to" with a search over
   the minis of the hoard and the chosen minis as chips with "×"; at the
   end "Cancel" (ghost) and "Leave the hoard" (primary).

   While the delete panel is open, it unfolds at the same place: the text
   "Delete this mini for good?", then "Cancel" (ghost) and "Delete"
   (`destructive`).

   For gone minis, a bar below the header on the `muted` surface: the
   departure ("Sold on {date}") and, for minis stripped for parts, "Parts
   went to {names}", each name a link; on the right "Back to hoard"
   (outline).
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
   swappable toggle, a small outlined rounded button reading "Glued" with a
   droplet icon or "Swappable" with a magnet icon. It looks the same in both
   states; only its icon and its label change.
   The last tile is the dashed "Add a part" tile with a plus. It opens the
   part picker below the tiles, separated by a border:
   - a filter input with a search icon;
   - the group "From the kit · {box name}": the parts the box's kit offers
     the minis' slot, as chips "+ {part}", in the kit's order;
   - the group "Your parts": the user's own terms of the vocabulary, those
     no catalog kit offers ([domain](../domains/hoard.md#parts)), as the
     same chips, by name;
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
   "Added {date} · box #{number} at {percent}%". After a border, "The kit suggests
   for a {name}" with the parts the kit's slots for the name to build
   offer as small muted chips; after another border the muted note "Kits
   only suggest. What you add here counts." Without a kit the card shows
   the box's name and neither the parts nor the note. A mini without a box
   added from the catalog shows the same card with the label "From the
   kit" for its kit, without link and without the "Added" line; a mini
   without a box and without a kit shows a card reading "Without box".

   Below it, only for minis that got the parts of stripped minis, a card
   "Parts from": one line per source mini, its name as a link and below
   it, muted, "Stripped on {date}".
8. Only while the minis are on the sprue: the build bar, sticking to the
   bottom of the screen while scrolling, on the card surface with a
   border and without a shadow: the summary on the left; on the right the
   checkbox "Put on workbench" and the primary button.

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
| Back link | Hoard; opened from a box: Box |
| Save note | On the sprue: Nothing is saved until you build it · otherwise: Saving… / All changes saved |
| Photo placeholder | Add photo |
| Title | The name; on the sprue the chosen suggestion or the typed own name, and the mini's name until one is chosen |
| Status badge | On the sprue / Built / Primed / Painted / Done |
| Faction chip | {faction}; own factions: {faction} · own |
| Add faction chip | + Faction |
| Workbench toggle | On the workbench / Put on workbench; not shown for gone minis |
| Mini menu button (accessible name) | More actions |
| Mini menu | Change origin box… · Leave the hoard… · Delete mini…; for gone minis: Change origin box… · Delete mini… |
| Leave panel heading | Leave the hoard |
| Reasons | Sold · Given away · Stripped for parts · Lost or broken |
| Date field | Day; today at first |
| Recipients field | Parts went to; placeholder: Search your minis |
| Leave buttons | Cancel · Leave the hoard |
| Delete panel | Delete this mini for good? |
| Delete buttons | Cancel · Delete |
| Gone bar | Sold on {date} · Given away on {date} · Stripped for parts on {date} · Lost or broken on {date} |
| Recipients line | Parts went to {names} |
| Back button | Back to hoard |
| Parts from card | Parts from; per source: {name}, below: Stripped on {date} |
| Status label | Status; on its right {percent}% (sprue 0, built 25, primed 50, painted 75, done 100) |
| Status bar labels | Built · Primed · Painted · Done |
| Build as heading | Build as |
| Suggestions note | Suggested by {box name} |
| Name tile | {name}; below: {n} left in this box · None left in this box |
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
| Box card label | From the box; for a mini without a box: From the kit |
| Box card link | {kit name} · {year}, below: {manufacturer} · {product code}; without a kit: {box name} |
| Box card progress | Added {date} · box #{number} at {percent}% |
| Box card parts | The kit suggests for a {name} |
| Box card note | Kits only suggest. What you add here counts. |
| Without box | Without box |
| Build summary | This mini becomes {name} with {parts}. — parts joined with ", ", a swappable one followed by " (swappable)"; without parts: This mini becomes {name}, no parts. Before a name is chosen: Choose what to build. |
| Build checkbox | Put on workbench |
| Build button | Build mini; disabled until a name is chosen |
| Not found | This mini isn't in your hoard. |
| Load failed | Can't load this mini right now. Try again in a moment. |
| Save failed | Can't save right now. Try again in a moment. |

## States

| State | When | What the user sees |
|-------|------|--------------------|
| Loading | The hoard is loaded | The back link; skeletons in the shape of the header and the status |
| On the sprue | The mini is on the sprue | The status "On the sprue", "Build as" with the mini's name chosen when it is a suggestion, else nothing chosen, parts preselected (see Behavior), the build bar; the save note says nothing is saved |
| Building | "Build mini" pressed | The button shows the busy stripes and "Building…"; the bar stays until the server answers |
| Built | The mini is past the sprue | No build bar; every change is saved at once, the save note says so |
| Without kit | The mini has no box and no kit, or its box no kit, or the kit can't be loaded | No suggestion tiles, only "Your own name", except for a mini on the sprue without a box, which is offered its own name as a tile; no "Suggested by"; the part picker has no kit group; the box card without kit, parts and note |
| Picker open | "Add a part" pressed | The part picker below the part tiles |
| Not found | No mini with this id in the user's hoard, also one of another user | The not-found message below the back link |
| Load failed | The server does not answer | The load-failed message in `destructive` below the back link, announced to screen readers |
| Save failed | A change or the build is not saved | The save-failed message in `destructive` in place of the save note, announced to screen readers; what was entered stays |
| Leaving | "Leave the hoard…" chosen in the mini menu | The leave panel; "Leave the hoard" disabled until a reason is chosen |
| Deleting | "Delete mini…" chosen in the mini menu | The delete panel |
| Gone | The mini is gone | The gone bar; no workbench toggle; on the sprue no build bar; everything else as for minis on the sprue or past it, saved at once |
| Parts from | Stripped minis name this mini as a recipient | The "Parts from" card |

## Behavior

- A click on a mini of the Minis tab of the [hoard](hoard.md), in a group
  card or a table line and outside selection mode, or on a mini of a
  [box](box.md) opens this screen for that mini. The screen is about that
  one mini only; minis alike to it are not changed with it.
- The back link leads back to where the screen was opened from: to the
  [box](box.md) of the mini when it was opened there, also after reloading
  the page, else to the Minis tab of the hoard. The browser's back button
  does the same. Search, filters and view of the hoard stay as they were.
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
  as it, and those built under an own name that had it on the sprue. A mini
  built from a slot of either-or names uses up each of them: building a Loota
  leaves one Burna Boy fewer as well. With none
  left, the line reads "None left in this box" and the tile is greyed out;
  it can still be chosen. Nothing is blocked: kits only suggest.
  A mini without a box added from a catalog kit is offered the names of
  the kit's slots that offer its sprue name ("Suggested by {kit name}"), without
  a line below them: there is no box to count in.
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
  summary follows every choice. "Put on workbench" is ticked at first, and
  the header's workbench toggle shows the same choice. "Build mini" sets
  the mini to built with the chosen name, parts, notes and workbench
  place; the minis alike to it stay on the sprue. Afterwards the screen
  shows the built mini.
- **Past the sprue** every change is saved at once: name, parts,
  workbench and the factions added or removed as soon as they are made, the notes
  when the text area loses focus. Each change applies to this mini only;
  a new name, new parts or factions move it into another group of the
  [hoard](hoard.md).
- A faction chip's "×" removes the faction from the minis. "+ Faction"
  opens a search over the user's own and the catalog factions in a
  popover below it, with "New faction" for a typed name no faction found
  has, as on [Add custom](add-custom.md); choosing or creating one adds it
  to the minis and closes the search. Factions already chosen are not
  offered. A new own faction is saved like any other change: on the sprue
  with building, past it at once.
- The box card's link opens [Box](box.md). Its parts follow the name to
  build: the chosen or typed one, else the minis' name; without parts for
  it the part line is left out.
- **Leaving the hoard:** "Leave the hoard…" opens the leave panel; the
  delete panel and the part picker close. "Leave the hoard" gives the
  mini the chosen reason, day and recipients
  ([domain](../domains/hoard.md#leaving-the-hoard)); it leaves the
  workbench. Afterwards the screen shows the gone mini. "Cancel" closes the panel and forgets what
  was chosen.
- "Parts went to" offers the minis of the hoard past the sprue that are
  not gone, except this one, each with its box, filtered by name like the
  part picker; choosing one adds it as a recipient.
- **Minis on the sprue** can leave the hoard as well (a sprue given away);
  for a gone mini on the sprue nothing is built and the build bar is not
  shown. "Back to hoard" brings it back on the sprue with the build bar.
- **Gone minis** are edited like the others, saved at once. "Back to
  hoard" removes the mini's departure; its recipients no longer show it as
  a source of parts.
- **Deleting:** "Delete mini…" opens the delete panel; the leave panel and
  the part picker close. "Delete" deletes the mini for good and leads to
  its [box](box.md), or to the Minis tab of the hoard when it has none;
  the box stays ([domain](../domains/hoard.md#boxes-and-kits)). When the
  mini was the box's last, gone ones included, the [box](box.md#behavior)
  opens with its empty boxes dialog.
  Deleted minis disappear from the recipients and sources of others.
- A source in the "Parts from" card and a name in "Parts went to" open
  this screen for that mini.
- "Add photo" and "Change origin box…" have no function yet.
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
- The reason tiles are toggle buttons with `aria-pressed` in a group
  labelled "Reason"; the leave and delete panels are regions labelled by
  their heading or text, and focus moves into them when they open and
  back to the menu button when they close.
- The gone bar is announced when the mini becomes gone.
- The save note is a live region; the not-found, load-failed
  and save-failed messages are announced.
- The photo placeholder is a button named "Add a photo"; the text area is
  labelled by "Notes".

## Test IDs

`mini-back`, `mini-save-note`, `mini-name`, `mini-status-badge`,
`mini-faction`, `mini-add-faction`, `mini-faction-search`,
`mini-faction-result`, `mini-faction-create`, `mini-workbench`,
`mini-menu`, `mini-change-origin`, `mini-leave`, `mini-delete`,
`mini-leave-panel`, `mini-leave-reason` (with `data-reason`: `sold`,
`given-away`, `stripped` or `lost`), `mini-leave-date`, `mini-leave-less`,
`mini-leave-count`, `mini-leave-more` (count stepper, only on [Box](box.md)), `mini-leave-recipients`,
`mini-leave-recipient-option`, `mini-leave-recipient`, `mini-leave-cancel`,
`mini-leave-confirm`, `mini-delete-panel`, `mini-delete-less`,
`mini-delete-count`, `mini-delete-more` (only on [Box](box.md)),
`mini-delete-cancel`, `mini-delete-confirm`, `mini-gone`,
`mini-gone-recipient`, `mini-back-to-hoard`, `mini-parts-from`,
`mini-parts-from-source`,
`mini-percent`, `mini-build-as`, `mini-build-as-name`, `mini-name-left`
(with `data-warning` while it warns), `mini-own-name`,
`mini-part`, `mini-part-name`, `mini-part-remove`, `mini-part-swappable`,
`mini-add-part`, `mini-part-filter`, `mini-part-group` (with `data-group`:
`kit`, `vocabulary`, `range` or `create`), `mini-part-group-name`,
`mini-part-option`, `mini-part-create`, `mini-notes`, `mini-box`,
`mini-origin` (the box card's link, or "Without box"), `mini-box-added`,
`mini-box-part`,
`mini-build-bar`, `mini-build-summary`, `mini-build-less`,
`mini-build-count`, `mini-build-more` (only on [Box](box.md)), `mini-build-workbench`,
`mini-build`, `mini-loading`, `mini-not-found`, `mini-error`,
`mini-save-error` (ADR-0013).

## Open questions

- Photos: how many per mini, and where files are stored.
- How the status is changed past the sprue, and set back; the bar only
  shows it.
- Minis on the sprue will soon be handled apart from built minis in the
  data model ([domain](../domains/hoard.md#open-questions)); building on
  this screen changes with it.
- Whether a mini on the sprue should be opened here at all, now that
  building usually happens on its box.
- What the screen asks when a mini becomes primed, painted or done.
- What "Change origin box…" does.
