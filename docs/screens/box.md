# Screen: Box

- **Route:** `/hoard/boxes/:id`
- **Domain:** `hoard`
- **Related:** [Hoard](hoard.md), [Domain: hoard](../domains/hoard.md),
  [Add box](add-box.md), [Mini](mini.md), [Shell](shell.md)

## Purpose

Everything about one box: what it was added from, how far its minis have
come, and the minis themselves. From here the user builds the minis on the
sprue, several at once, and changes the status of the built ones.

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
3. The progress, without a card: the label "Progress" in small
   `muted-foreground` text with the percentage on its right; the progress
   bar; below it a legend with one entry per status in pipeline order (on
   the sprue, built, primed, painted, done), each with a colored dot, the
   status in `muted-foreground` and its count, also 0, at the entry's
   right end. The entries have no surface of their own; they share the
   width in one row and wrap on narrow screens.
4. While selecting, the selection bar of the [hoard](hoard.md#layout),
   sticking to the top when scrolling.
5. Two columns: on the left the built minis, below them the minis on
   the sprue and below those the gone minis (wide), on the right the kit
   card (narrow). When the content
   is narrower than about 720 px, the kit card moves below the minis.

**Minis**: the minis past the sprue. The heading "Minis" with their count,
and on its right "Select" (ghost); without built minis, "Select" sits on
the right of the "Gone" heading instead. Below it
one card per group, stacked with a small gap. A group holds the built
minis of the box with the same name, parts and factions; their status and
workbench place may differ.

- Closed, a card shows on the left the name and below it the parts as
  small muted chips (the factions first when they differ from the box's);
  on the right a small progress bar of the group's minis, as the box's
  bar, with a legend below it of the statuses the group has, each a
  colored dot, the count and the status; then "×{count}" and a chevron.
- Opened, below a border, one line per mini of the group: the round
  check of the [hoard](hoard.md#layout), a small square photo
  placeholder, the name, the "Workbench" tag when the mini is on
  the workbench, and on the right a segmented control "Built · Primed ·
  Painted · Done" with the mini's status on the `muted` surface. The
  lines follow the group's order: furthest status first.

**On the sprue**: the minis still on the sprue, below the built ones. The
heading "On the sprue" with their count; below it one card per row of alike minis
([domain](../domains/hoard.md#lists-of-minis)), at most one of them open.

- Closed, a card shows the name, "×{count}", a chevron and the "⋮"
  button for the row's menu. No status badge: on the sprue there is none.
- Opened by a click on its header, below a border, the build panel: the
  "Build as" and "Parts" sections of [Mini](mini.md#layout), with the part
  picker, for the minis of the row; at the bottom, after a border, the
  build line: the summary on the left; on the right the count stepper
  "− {n} + of {N}" (only for rows of more than one mini), the checkbox
  "Put on workbench" and the primary build button.
- Opened through the row menu, the leave or the delete panel of
  [Mini](mini.md#layout) in place of the build panel, each with the count
  stepper for rows of more than one mini.

**Gone**: the minis of the box that left the hoard, below the minis on the
sprue. The heading "Gone" with their count as a button with a chevron;
closed at first. Opened, one line per gone mini: the round check, the
name and, on its right in muted text, the departure ("Sold on {date}").

Cards on the sprue have no check: their alike minis are picked by the
count stepper.

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
| Progress badge | Untouched / Started / Done / All gone / Empty |
| Kit line | {kit name} · {product code, if any}; "No kit" for boxes without one |
| Meta line | {factions} · added {date} |
| Buttons | Take from the sprue · Edit box |
| Box menu button (accessible name) | More actions |
| Box menu | Add a mini to this box · Delete box… |
| Progress heading | Progress |
| Progress percentage | {n}% |
| Status legend | On the sprue / Built / Primed / Painted / Done, each with its count |
| Minis heading | Minis {count of built minis} |
| Selection button | Select |
| Selection bar, delete dialog, empty boxes dialog | as in the [hoard](hoard.md#content) |
| Row check (accessible name) | Select {name} |
| Group card | {name}, {parts}; legend: {count} {status} per status the group has; ×{count} |
| Group toggle (accessible name) | {name} |
| Mini line | {name}, Workbench |
| Status control | Built · Primed · Painted · Done; group named "Status of {name}" |
| Sprue heading | On the sprue {count} |
| Sprue card | {name}, ×{count} |
| Sprue toggle (accessible name) | {name} |
| Row menu (accessible name) | More actions |
| Row menu | Leave the hoard… · Delete… |
| Build panel | "Build as" and "Parts" as on [Mini](mini.md#content) |
| Build summary | {n} of {N} alike minis becomes {name} with {parts}. — several: become; for a row of one mini: This mini becomes {name} with {parts}; otherwise as on [Mini](mini.md#content) |
| Name tile | as on [Mini](mini.md#content); when the chosen count is larger than what is left: Only {n} left in this box |
| Count stepper | − {n} + of {N}; buttons: One fewer, One more |
| Build checkbox | Put on workbench |
| Build button | Build mini · Build {n} minis; disabled until a name is chosen |
| Leave panel | as on [Mini](mini.md#content); several: Leave the hoard ({n}) |
| Delete panel | Delete this mini for good? · Delete {n} minis for good? |
| Gone heading | Gone {count} |
| Gone line | {name}; {reason} on {date} |
| Kit card label | Added from the kit |
| Kit name | {name} · {year}, as on [Add box](add-box.md#content) |
| Draft badge | Not checked |
| Release line | {manufacturer} · {product code}, leaving out the code when the kit has none |
| Suggestions label | The kit suggests |
| Slot row | {count}× · the suggested names joined with " or " · the parts |
| Kit note | Kits only suggest. Changing the kit never changes this box. |
| No minis | No minis in this box. |
| Delete box dialog | Delete {box name} for good? |
| Delete box text | Its {n} minis are deleted with it, gone ones included. — one: Its mini is deleted with it. — none: leaves the sentence out. This can't be undone. |
| Delete box buttons | Cancel · Delete box |
| Delete box failed | Can't delete right now. Try again in a moment. |
| Not found | This box isn't in your hoard. |
| Load failed | Can't load this box right now. Try again in a moment. |
| Kit failed | Can't load the kit right now. Try again in a moment. |
| Kit missing | The catalog no longer has this version of the kit. |
| Save failed | Can't save right now. Try again in a moment. |

## States

| State | When | What the user sees |
|-------|------|--------------------|
| Loading | The box is loaded | The back link; skeletons in the shape of the header, the progress and three mini cards |
| Nothing built | Every mini of the box is on the sprue | No "Minis" section; "On the sprue" only |
| Group open | A group card's header was clicked | The card shows its minis, each with the status control |
| Sprue card open | A card on the sprue was clicked, or "Take from the sprue" pressed | The card shows its build panel; another open card on the sprue closes |
| Too many | The chosen count is larger than what is left for the chosen name | The chosen name tile's line in `destructive`: Only {n} left in this box; nothing is blocked |
| Building | The build button pressed | The button shows the busy stripes and "Building…" until the server answers |
| Leaving | "Leave the hoard…" chosen in a row menu | The card open with the leave panel; "Leave the hoard" disabled until a reason is chosen |
| Deleting | "Delete…" chosen in a row menu | The card open with the delete panel |
| Not selecting, Selecting, Selected, Only gone selected, Confirming delete, Deleting | as in the [hoard](hoard.md#states), for the lines of open group cards and of the opened "Gone" section | as in the hoard; "Select" is disabled while selecting |
| Saving a status | A status of a mini was chosen | The control shows the chosen status at once; when the server does not answer, it shows the stored status again and the save-failed message appears above the minis, announced to screen readers |
| Box | The box is loaded | Header, progress, minis and, for boxes from a kit, the kit card |
| Without kit | The box was not added from a kit | "No kit" as the kit line; no kit card, the minis take the full width |
| All on the sprue | Every mini of the box is on the sprue | The progress badge "Untouched", 0%, an empty bar |
| Nothing left on the sprue | No mini of the box is on the sprue | "Take from the sprue" is not shown; no "On the sprue" section |
| Nothing gone | No mini of the box is gone | No "Gone" section |
| Empty | The box has no minis | The progress badge "Empty", no percentage, an empty bar; no "Minis", "On the sprue" or "Gone" section; the no-minis message in their place; no "Select" |
| Boxes emptied | The minis deleted from the box were its last, gone ones included | The empty boxes dialog of the [hoard](hoard.md#states) for this box |
| Deleting the box | "Delete box…" chosen in the box menu | The delete box dialog; "Delete box" shows the busy stripes until the server answers; when it does not, nothing is deleted and the delete-box-failed message appears in the dialog |
| All gone | Every mini of the box is gone | The progress badge "All gone", no percentage, an empty bar; no "Minis" and no "On the sprue" section; the "Gone" section open |
| Not found | No box with this id in the user's hoard, also one of another user | The not-found message below the back link |
| Load failed | The server does not answer | The load-failed message in `destructive` below the back link, announced to screen readers |
| Kit failed | The server does not answer for the kit | The kit-failed message in muted text in place of the kit card |
| Kit missing | The catalog has no such version of the kit | The kit-missing message in muted text in place of the kit card |

## Behavior

- A click on a box in the Boxes tab of the [hoard](hoard.md), as card or
  table line and outside selection mode, opens this screen. The back link
  and the browser's back button return to the Boxes tab with its search,
  filters and view as they were.
- Progress, badge, percentage, bar and legend follow the
  [domain rule](../domains/hoard.md#boxes-and-kits) and the progress bar of
  the [hoard](hoard.md#behavior): derived from the minis that are not
  gone, never stored, minis on the sprue are the empty background of the
  bar. Groups, the minis on the sprue and the counts leave gone minis
  out.
- The groups are sorted by the furthest status of their minis, from done
  back to built, then by name; the minis of a group by status the same
  way. The minis on the sprue are sorted by name.
- Either-or names show a muted "or" as on the [hoard](hoard.md#behavior).
- A click on a group card's header opens or closes it; all are closed at
  first.
- A click on a mini's line in an open group, outside selection mode, opens [Mini](mini.md)
  for that mini.
- Choosing a status in a mini's control saves it at once for that one mini
  ([domain](../domains/hoard.md)); "Done" takes it off the workbench. The
  mini stays in its group. Afterwards the group's bar and legend, the
  box's progress and its badge show the new state.
- A click on the header of a card on the sprue opens or closes its build
  panel; all are closed at first, and opening one closes the others.
  "Take from the sprue" opens the first card on the sprue and moves the
  focus into it.
- **Building** works as on [Mini](mini.md#behavior): Build as, the
  preselected parts, the part picker and "Put on workbench" (ticked at
  first) behave the same, and nothing is saved until the build button.
  The count stepper goes from 1 to the number of minis in the row. The
  build button sets that many minis of the row to built with the chosen
  name, parts, notes and workbench place; the rest of the row stays on the
  sprue. Afterwards the card closes and the built minis appear in their
  group.
- The row menu offers "Leave the hoard…" and "Delete…". Each opens the
  card with its leave or delete panel, closing the others; "Cancel" closes
  the card and forgets what was chosen.
- **Leaving** works as on [Mini](mini.md#behavior) for as many minis of
  the row as the count stepper says; they move to "Gone".
- **Deleting** deletes as many minis of the row as the count stepper says;
  the box stays ([domain](../domains/hoard.md#boxes-and-kits)).
- When deleted minis were the box's last, gone ones included, here or on
  [Mini](mini.md#behavior), the empty boxes dialog asks whether to delete
  the box as well: "Delete box" deletes it and leads to the Boxes tab of
  the hoard; "Keep box" and Escape keep it, and the screen shows the
  empty box.
- A click on the "Gone" heading opens or closes the section; a click on a
  gone mini's line opens [Mini](mini.md) for that mini.
- **Selecting** works as in the [hoard](hoard.md#behavior), for the built
  minis in the group cards and the gone minis. In selection mode a click
  on a mini's line selects or deselects it instead of opening it; the
  status controls still work. "Select all" selects every built and gone
  mini of the box, also those of closed groups and of the closed "Gone"
  section. The actions of the selection bar work as in the hoard.
- The kit card shows the kit as it was when the box was added: the version
  the box records. A newer version of a catalog kit never changes it.
- "Delete box…" opens the delete box dialog. "Delete box" deletes the box
  and all its minis for good, gone ones included
  ([domain](../domains/hoard.md#boxes-and-kits)), and leads to the Boxes
  tab of the hoard; "Cancel" and Escape close the dialog.
- "Edit box" and "Add a mini to this box" have no function yet.

## Accessibility

- The box menu button has `aria-haspopup="menu"` and `aria-expanded`.
- The progress bar is an image named after the counts per status past the
  sprue, as in the hoard ("1 built, 4 primed, 1 painted").
- A group card's header is a button named after the group, with
  `aria-expanded` and `aria-controls` for its list of minis; the count is
  announced as "{count} minis", "1 mini".
- A group's progress bar is an image named after its counts, as the box's.
- A mini's status control is a group named "Status of {name}" of toggle
  buttons with `aria-pressed`.
- The header of each card on the sprue is a button named after its minis,
  with `aria-expanded` and `aria-controls` for its panel; its count is
  announced as for a group. The panels are named as on
  [Mini](mini.md#accessibility), and focus moves into them when they open
  and back to the row menu button when they close.
- Each gone mini's line is a button named after the mini.
- Each check is named after its mini ("Select Boy"); the selection bar
  and the dialogs are accessible as in the
  [hoard](hoard.md#accessibility); the delete box dialog is an alert
  dialog as well and opens with the focus on "Cancel".
- The "Gone" heading is a button with `aria-expanded` and
  `aria-controls` for its cards.
- The save-failed message is announced to screen readers.
- The not-found and load-failed messages are announced to screen readers.

## Test IDs

`box-back`, `box-name`, `box-progress-badge`, `box-kit-line`, `box-meta`,
`box-tag`, `box-take`, `box-edit`, `box-menu`,
`box-add-mini`, `box-delete`, `box-percent`, `box-progress`, `box-status`,
`box-group`, `box-group-toggle`, `box-group-progress`, `box-group-mini`,
`box-group-mini-open`, `box-group-status` (with `data-status`),
`box-sprue`, `box-sprue-toggle`, `box-sprue-panel`, `box-sprue-menu`,
`box-sprue-leave`, `box-sprue-delete`, `box-gone-toggle`, `box-gone`,
`box-select`, `box-group-mini-check`, `box-gone-check`,
`box-selection-bar`, `box-selection-count`, `box-selection-edit`,
`box-selection-leave`, `box-selection-delete`, `box-selection-menu`,
`box-select-all`, `box-select-done`, `box-delete-dialog`,
`box-delete-cancel`, `box-delete-confirm`, `box-delete-error`,
`box-empty-boxes-dialog`, `box-empty-boxes-keep`, `box-empty-boxes-delete`,
`box-empty-boxes-error`, `box-delete-box-dialog`, `box-delete-box-cancel`,
`box-delete-box-confirm`, `box-delete-box-error`, `box-no-minis`;
inside an open card on the sprue the build, leave and delete panels carry
the test IDs of [Mini](mini.md#test-ids); `box-save-error`, `box-kit`,
`box-kit-draft`, `box-kit-slot`, `box-kit-error`, `box-kit-missing`, `box-loading`, `box-not-found`, `box-error` (ADR-0013).

## Open questions

- What "Edit box" edits (name, factions, tags, date).
- The leave page of the [hoard](hoard.md#open-questions), which replaces
  the leave panel of the cards on the sprue.
- Whether the kit card should say when the catalog has a newer version of
  the kit.
- Photos in place of the placeholder.
