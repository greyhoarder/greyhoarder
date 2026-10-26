# Screen: Hoard

- **Route:** `/hoard/minis` and `/hoard/boxes`, one per tab; `/hoard` leads
  to `/hoard/minis`
- **Domain:** `hoard`
- **Related:** [Domain: hoard](../domains/hoard.md),
  [ADR-0019](../adr/0019-hobby-data-model.md), [Shell](shell.md),
  [Box](box.md), [Mini](mini.md)

## Purpose

The overview of everything a user owns. The Minis tab shows every mini
past the sprue with its status, found by name, part or box, in groups of
minis with the same name, factions and parts (see
[Lists of minis](../domains/hoard.md#lists-of-minis)); minis on the sprue
are taken from their [box](box.md). The Boxes tab shows
what was bought: each box with its progress, date and tags.

## Layout

Inside the [shell](shell.md), one content column over the full width beside
the sidebar, from top to bottom:

1. Header: title and summary on the left; on the right one button per way
   into the hoard: "Add boxes" (primary), "Add minis" and "Add custom"
   (outline).
2. Tab bar over the full width with a bottom border: the tabs "Minis" and
   "Boxes" as links to their routes, with their counts as badges, the
   active one underlined in gold; switching tabs keeps search, filters and
   selection of both tabs, and the browser's back button returns to the
   previous tab;
   on the right the "Select" button (ghost) for the open tab and the view
   switch with "Cards" and "Table", which applies to both tabs.
3. Filter row: the search field, the filter chips "Faction", "Status" and
   "Box", then "Reset" while a filter is active. Inactive chips
   have a dashed border, active ones a solid border on the card surface.
4. While selecting, the selection bar, sticking to the top when scrolling:
   the number of selected minis; the actions "Edit", "Leave the hoard…"
   and "Delete…" (outline, "Delete…" in `destructive` text); a divider,
   "Select all" and "Done". On narrow screens "Select all", "Leave the
   hoard…" and "Delete…" move into a "⋮" menu of the bar.
5. The minis as group cards or as a table.

**Cards** (the default view): one card per group, stacked with a small
gap, built like the group cards of [Box](box.md#layout):

- Closed, a card shows a square photo placeholder with diagonal stripes;
  the name, below it a line with the factions and the box (or "{n} boxes"
  when its minis come from several), and below that the parts as small
  muted chips (none if there are none); on the right a small progress bar
  of the group's minis with a legend of the statuses the group has, each a
  colored dot, the count and the status; then "×{count}" and a chevron.
- Opened, below a border, one line per mini: the round check, a small
  square photo placeholder, the name followed by the "Workbench" tag when
  the mini is on the workbench, below it in muted text its box; on the
  right the status badge.

Texts are cut off with an ellipsis instead of wrapping. On narrow screens
the photo is smaller and the legend wraps below the bar.

**Table**: one line per mini in a bordered table: the round check, Name
(with the "Workbench" tag and the parts below in small text), Faction,
Box and Status (badge). Every column header
except the check sorts the table; the current column shows an arrow
for its direction, the others a faint up-down sign. The table scrolls
sideways on narrow screens.

### Boxes tab

The same tab bar; below it a filter row with "Search boxes" and the filter
chips "Faction", "Progress" and "Tag" (plus "Reset"), then, while
selecting, a selection bar ("{n} box(es) selected", "Select all", "Done"),
then the boxes as cards or as a table. Boxes are selected like minis: a
round check on the photo's top left corner (cards) or at the start of the
line (table).

**Cards**: a grid whose columns follow the width of the content, so it
changes when the sidebar collapses: four columns from 1280 px, three from
1024 px, two from 672 px, one below; newest box first. A card holds a striped photo placeholder
with the round check and the progress badge on its top left and a "⋮"
button on its top right; below it the box name with the kit line under it
and the progress percentage on the right, the progress bar with a status
line under it in one line (a colored dot and the count for built, primed,
painted and done, also 0), and a line with factions and date followed by
the tags as small outlined badges.

**Table**: the round check, Box (name, kit line below in small text), Faction, Progress
(bar with the percentage on its right), On the sprue, Painted ("{n} of
{all}"), Added and the "⋮" button. Sorted by Added, newest first; every
header except the menu sorts it like the minis table. Below the table a
summary line.

## Content

| Element | Text or content |
|---------|-----------------|
| Browser tab title | Hoard · Greyhoarder |
| Title | Hoard |
| Summary | {minis} minis from {boxes} boxes · {painted} painted |
| Add buttons | Add boxes · Add minis · Add custom |
| Tabs | Minis {count} · Boxes {count}; while a search or filter narrows the list: Minis {shown} of {all} |
| Selection button | Select |
| View switch (accessible names) | Cards / Table |
| Search placeholder | Search name, part or box |
| Filter chips | Faction · Status · Box, each with a ⊕ icon |
| Filter list | Search field named after the chip, one row per value with checkbox and number of minis ("Without box" last); "Nothing found." without matches; "Clear filter" while something is ticked |
| Reset button | Reset ✕ |
| Table headers | Name · Faction · Box · Status |
| Selection bar | {count} mini(s) selected · Edit · Leave the hoard… · Delete… · Select all · Done |
| Selection menu (accessible name) | More actions for the selection |
| Delete dialog | Delete {n} minis for good? — one: Delete this mini for good? |
| Delete dialog text | The names with their counts, e.g. "Boy ×2, Nob". This can't be undone. |
| Delete dialog buttons | Cancel · Delete {n} minis — one: Delete mini |
| Delete failed | Can't delete right now. Try again in a moment. |
| Empty boxes dialog | {box name} has no minis left. Delete the box as well? — several: {n} boxes have no minis left: {box names}. Delete them as well? |
| Empty boxes buttons | Keep box · Delete box — several: Keep boxes · Delete boxes |
| Group origin line (cards) | {factions} · {box, "{n} boxes" or "Without box"} |
| Group legend | {count} {status} per status the group has |
| Group toggle (accessible name) | {name} |
| Mini line (cards) | {name}, Workbench; below: {box or "Without box"} |
| Workbench tag | Workbench |
| Status badge | On the sprue / Built / Primed / Painted / Done |
| Gone badge | Sold · Given away · Stripped for parts · Lost or broken, in place of the status badge |
| Status filter values | Built · Primed · Painted · Done · Gone |
| Count | ×{count} |
| Row check (accessible name) | Select {name} |
| No minis yet | No minis built yet. Build the minis of a box and they appear here. |
| No results | No minis match "{query}". — without a search: No minis match the filters. |
| Box search placeholder | Search boxes |
| Box filter chips | Faction · Progress · Tag |
| Kit line | {kit name} · {article number, if any}; "No kit" for boxes without one |
| Progress badge and word | Untouched / Started / Done / All gone / Empty |
| Progress percentage | {n}% |
| Progress bar (tooltip and accessible name) | Counts per status past the sprue, in pipeline order, e.g. "5 primed, 5 done" |
| Status line (cards) | {n} built · {n} primed · {n} painted · {n} done |
| Box selection bar | {n} box(es) selected · Select all · Done |
| Box meta line (cards) | {factions} · added {date} |
| Date | e.g. 12 Oct 2026 |
| Box table headers | Box · Faction · Progress · On the sprue · Painted · Added |
| Box summary (table) | {n} boxes · {n} minis still on the sprue |
| No boxes yet | No boxes yet. Add your first box to start your hoard. |
| No boxes found | No boxes match "{query}". — without a search: No boxes match the filters. |
| Load failed | Can't load your hoard right now. Try again in a moment. |

## States

| State | When | What the user sees |
|-------|------|--------------------|
| Loading | The hoard is loaded for the first time | Skeletons in the shape of what comes: a line in place of the summary, three placeholder cards in place of the list |
| Load failed | The server does not answer | The load-failed message in `destructive` below the header, announced to screen readers; no list |
| Empty | The hoard has no minis past the sprue (Minis tab) or no boxes (Boxes tab) | The no-minis-yet or no-boxes-yet message in place of the list |
| List | The hoard has minis past the sprue | Group cards, closed, sorted by army |
| Group open | A group card's header was clicked | The card lists its minis |
| Table | "Table" in the view switch | One line per mini, at first sorted by faction |
| Searching | Text in the search field | Only minis whose name, a part or the box contains the text; the tab counts what is shown |
| Filtered | Values ticked in a filter chip | Only matching minis; the chip shows up to two ticked values as badges after a divider, more as "{n} selected"; "Reset" appears |
| Gone shown | "Gone" ticked in the Status filter | The gone rows as well, each with its gone badge in place of the status badge |
| No results | Search and filters match nothing | The no-results message in place of the list |
| Not selecting | Initially, or after "Done" | No checks, except on the mini under the pointer or with keyboard focus; no selection bar |
| Selecting | "Select" pressed, or a mini's check ticked | Every mini line shows its check; the selection bar appears; "Select" is disabled; the actions are disabled while nothing is selected |
| Only gone selected | Every selected mini is gone | "Leave the hoard…" is disabled |
| Confirming delete | "Delete…" pressed | The delete dialog over the dimmed screen |
| Deleting | "Delete {n} minis" pressed | The button shows the busy stripes until the server answers; when it does not, nothing is deleted and the delete-failed message appears in the dialog, announced to screen readers |
| Boxes emptied | The deleted minis were the last minis of boxes, gone ones included | The empty boxes dialog; deleting the boxes shows the busy stripes and, when the server does not answer, the delete-failed message as the delete dialog does |
| Selected | A mini is selected | Its check is filled gold and its line gets a faint gold background; a group card with selected minis gets a gold border |
| Boxes | The "Boxes" tab is active | The boxes as cards or table, depending on the view switch |
| Boxes filtered | Search text or ticked values on the Boxes tab | Only matching boxes; the table's summary counts what is shown |

## Behavior

- Minis on the sprue are left out of the Minis tab, its counts and its
  filters' numbers; they are built on their [box](box.md). The summary
  counts every mini that is not gone, on the sprue or not.
- A group holds the minis past the sprue with the same name, factions
  and parts, each glued or swappable alike, from any box
  ([domain](../domains/hoard.md#lists-of-minis)). Its bar and legend count
  its minis as the box's bar counts a box. A group lists its minis sorted
  by status, furthest first, then by box.
- Search and filters pick minis, not groups: a group shows only its
  minis that match, counts only those and is left out when none does.
- A click on a group card's header opens or closes it; all are closed at
  first and stay as they were while the search or the filters change.
- Gone minis ([domain](../domains/hoard.md#leaving-the-hoard)) are left
  out of the Minis tab, its counts, the summary and the other filters'
  numbers, unless "Gone" is ticked in the Status filter: then gone rows
  are shown as well, matched like the other statuses (any ticked value
  matches). "Gone" comes last in the Status filter and counts the gone
  minis.
- Boxes count only their minis that are not gone: progress, "On the
  sprue", "Painted" and the box summary. A box whose minis are all gone
  shows "All gone" as its progress, a box without any minis "Empty"; both
  without a percentage and with an empty bar, and both as values of the
  Progress filter.
- "Painted" in the summary counts painted and done minis.
- Status badges are grey while a mini is unpainted, a lighter grey with
  each step, and gold from painted on (design system: gold means done).
- The search ignores case and needs no confirmation.
- The gone badge is outlined with a muted text.
- Names of either-or kits, and of the boxes and minis made from them, show
  their outcomes apart by a muted "or" ("Lootas or Burna Boyz") on cards,
  in tables and in titles; in plain text, such as the kit line, a filter
  value or the browser tab, the "or" is plain. The stored names keep
  " / " ([domain](../domains/hoard.md#boxes-and-kits)).
- The "Box" filter tells boxes apart, not names: boxes with the same name
  are separate values, each followed by the day it was added, e.g.
  "Boyz (2026) · 12 Oct 2026".
- Filter chips work like faceted filters: a chip opens a list of the values
  in the hoard with how many minis have each, searchable by typing. Ticked
  values of one chip are alternatives (any matches); different chips must
  all match, and so must the search. "Reset" clears all filters, not the
  search.
- Only the table sorts. Cards always show the groups sorted by army. The
  table starts sorted by faction; a click on a new column header sorts it
  ascending, a click on the current one switches between ascending and
  descending. Rows without a box sort after those with one.
- Selecting works like photo apps and mail clients: hovering a mini or
  moving the keyboard focus to its check shows the check; ticking it starts
  selection mode. "Select" starts the mode without a pointer, e.g. on touch
  screens. Only single minis are selected, in an open group card or a
  table line; a group card has no check of its own.
- In selection mode a click anywhere on a mini's line selects or deselects
  it. Outside it, a click on a mini's line opens [Mini](mini.md) for that
  mini, and a click on a box opens [Box](box.md). Returning from there
  keeps the tab's search, filters, view and open groups.
- A mini's line has no menu of its own: it is opened by a click, and it
  leaves the hoard or is deleted through the selection, also alone.
- "Select all" selects every mini that is currently shown, also those of
  closed groups. "Done" ends the mode and clears the selection.
- The actions of the selection bar act on the selected minis:
  - "Edit" opens the bulk edit view; it has no function yet.
  - "Leave the hoard…" is to lead to the leave page for the selected
    minis that are not gone; gone ones are left out. Until that page
    exists, it has no function.
  - "Delete…" opens the delete dialog. "Delete {n} minis" deletes the
    selected minis for good; their boxes stay
    ([domain](../domains/hoard.md#boxes-and-kits)). Afterwards the dialog
    closes and the selection mode ends. "Cancel" and Escape close the
    dialog and keep the selection.
  - When boxes have no minis left afterwards, gone ones included, the
    empty boxes dialog asks once for all of them: "Delete box(es)"
    deletes them, "Keep box(es)" and Escape keep them as empty boxes.
- A box's progress follows the [domain rule](../domains/hoard.md#boxes-and-kits):
  untouched, started or done, and a percentage weighted by status. The bar
  is split by status in the colors of the status badges and always in the
  order of the pipeline (built, primed, painted, done) and aligned to the
  right, so done ends at the right end, with small gaps between the parts.
  Minis on the sprue are no progress: they are the empty background of the
  bar on its left and are not counted in the status line. The
  progress badge is grey until done and gold when done.
- The box search looks at the box name, the kit name, the article number
  and the tags. Progress values are ticked like statuses; a box matches a
  tag filter when it carries any of the ticked tags.
- Until the hoard comes from the server, the screen shows placeholder rows
  and boxes.
  "Add boxes" opens [Add box](add-box.md); "Add minis" and "Add custom"
  have no function yet.

## Accessibility

- Each checkbox is named after its mini ("Select Boy").
- The selection bar's "⋮" button has `aria-haspopup="menu"` and
  `aria-expanded`.
- The delete dialog is an alert dialog named by its question and
  described by its text. It opens with the focus on
  "Cancel", keeps the focus inside while open, and gives it back to
  "Delete…" (or the "⋮" button) when it closes without deleting.
- The empty boxes dialog is an alert dialog named by its question; it
  opens with the focus on the keep button.
- Sortable table headers are buttons, and the current column carries
  `aria-sort`.
- The view switch marks the current view with `aria-pressed`.
- The name of each mini, in its line of a group card and in its table
  line, and of each box is a button: it opens the mini or the box, or
  selects it in selection mode, so both open by keyboard as well.
- A group card's header is a button named after the group, with
  `aria-expanded` and `aria-controls` for its list of minis; its count is
  announced as "{count} minis", "1 mini", and its progress bar is an image
  named after its counts, as a box's.

## Test IDs

`hoard-summary`, `hoard-add-boxes`, `hoard-add-minis`, `hoard-add-custom`,
`hoard-tab-minis`, `hoard-tab-minis-count`, `hoard-tab-boxes`,
`hoard-select`, `hoard-view-cards`, `hoard-view-table`, `hoard-search`,
`hoard-filter-faction`, `hoard-filter-status`, `hoard-filter-box`, `hoard-filter-option`, `hoard-filter-reset`,
`hoard-table`, `hoard-sort-<column>`, `hoard-group`, `hoard-group-toggle`,
`hoard-group-progress`, `hoard-row` (a mini's line in a group card or the
table), `hoard-row-check`, `hoard-row-open`, `hoard-status`, `hoard-gone`, `hoard-selection-bar`,
`hoard-selection-count`, `hoard-selection-edit`, `hoard-selection-leave`,
`hoard-selection-delete`, `hoard-selection-menu`, `hoard-select-all`,
`hoard-select-done`, `hoard-delete-dialog`, `hoard-delete-cancel`,
`hoard-delete-confirm`, `hoard-delete-error`, `hoard-empty-boxes-dialog`,
`hoard-empty-boxes-keep`, `hoard-empty-boxes-delete`,
`hoard-empty-boxes-error`,
`hoard-no-results`, `hoard-box-search`, `hoard-box-filter-faction`,
`hoard-box-filter-progress`, `hoard-box-filter-tag`,
`hoard-box-filter-option`, `hoard-box-filter-reset`, `hoard-box`,
`hoard-box-progress`, `hoard-box-percent`, `hoard-box-statuses`,
`hoard-box-menu`, `hoard-box-selection-bar`, `hoard-box-selection-count`,
`hoard-box-select-all`, `hoard-box-select-done`, `hoard-box-table`,
`hoard-box-sort-<column>`, `hoard-box-summary`, `hoard-box-no-results`,
`hoard-loading`, `hoard-box-loading`, `hoard-empty`, `hoard-box-empty`,
`hoard-error` (ADR-0013).

## Open questions

- What each add button opens; whether Workbench becomes a filter chip as
  well.
- Mobs and squads are left out for now (domain doc); if they come, the
  screen gets them as a chip and a column.
- Filtering by a faction should include the factions that are part of it
  (domain doc); the placeholder rows only know faction names.
- The leave page: one page to let one or several minis leave the hoard,
  with room to tell which minis got the parts of stripped ones; it
  replaces the leave panels of [Mini](mini.md) and [Box](box.md).
- The bulk edit view for selected minis.
- Starting selection mode with a long press on touch screens.
- What acting on selected boxes offers; what the box menu offers.
- Whether the box list should count "x of y" on its tab like the minis.
- Photos in place of the placeholder.
- Whether sorting by faction should follow the hierarchy of factions
  instead of the alphabet.
- Whether the chosen view should be remembered.
- Known issue: the search looks at the stored names, which join the
  outcomes of either-or kits with " / ". Typing what the screen shows,
  "Lootas or Burna Boyz", finds nothing; "Lootas" or "Burna" does. The
  data model will change later to keep these names without " / " (see
  [domain](../domains/hoard.md#open-questions)).
