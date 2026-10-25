# Screen: Hoard

- **Route:** `/hoard/minis` and `/hoard/boxes`, one per tab; `/hoard` leads
  to `/hoard/minis`
- **Domain:** `hoard`
- **Related:** [Domain: hoard](../domains/hoard.md),
  [ADR-0019](../adr/0019-hobby-data-model.md), [Shell](shell.md),
  [Box](box.md)

## Purpose

The overview of everything a user owns. The Minis tab shows every mini
with its status, found by name, part or box; alike minis share a row (see
[Lists of minis](../domains/hoard.md#lists-of-minis)). The Boxes tab shows
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
   the number of selected minis, "Select all" and "Done".
5. The minis as cards or as a table.

**Cards** (the default view): one card per row, stacked with a small gap,
all of the same height. A card holds, from left to right: a square photo
placeholder with diagonal stripes and a round check on its top left
corner; the name, followed by a "Workbench" tag when the minis are on the
workbench, then a line with factions and box, then a line with the
parts (empty if there are none); the status badge; the count; a "⋮" button
for the row's menu. Texts are cut off with an ellipsis instead of
wrapping. On narrow screens the photo is smaller and the status badge sits
above the count.

**Table**: one line per row in a bordered table: the round check, Name
(with the "Workbench" tag and the parts below in small text), Faction,
Box, Status (badge), Count and the "⋮" button. Every column header
except check and menu sorts the table; the current column shows an arrow
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
| Table headers | Name · Faction · Box · Status · Count |
| Selection bar | {count} mini(s) selected · Select all · Done |
| Row origin line (cards) | {factions} · {box or "Without box"} |
| Workbench tag | Workbench |
| Status badge | On the sprue / Built / Primed / Painted / Done |
| Count | ×{count} |
| Row check (accessible name) | Select {name} |
| Row menu (accessible name) | More actions |
| No minis yet | No minis yet. Add a box and its minis appear here. |
| No results | No minis match "{query}". — without a search: No minis match the filters. |
| Box search placeholder | Search boxes |
| Box filter chips | Faction · Progress · Tag |
| Kit line | {kit name} · {article number, if any}; "No kit" for boxes without one |
| Progress badge and word | Untouched / Started / Done |
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
| Empty | The hoard has no minis (Minis tab) or no boxes (Boxes tab) | The no-minis-yet or no-boxes-yet message in place of the list |
| List | The hoard has minis | Cards, sorted by army |
| Table | "Table" in the view switch | The same rows as a table, at first sorted by faction |
| Searching | Text in the search field | Only rows whose name, a part or the box contains the text; the tab counts what is shown |
| Filtered | Values ticked in a filter chip | Only matching rows; the chip shows up to two ticked values as badges after a divider, more as "{n} selected"; "Reset" appears |
| No results | Search and filters match nothing | The no-results message in place of the list |
| Not selecting | Initially, or after "Done" | No checks, except on the row under the pointer or with keyboard focus; no selection bar |
| Selecting | "Select" pressed, or a row's check ticked | Every row shows its check; the selection bar appears; "Select" is disabled |
| Selected | A row is selected | Its check is filled gold; a card gets a gold border, a table line a faint gold background |
| Boxes | The "Boxes" tab is active | The boxes as cards or table, depending on the view switch |
| Boxes filtered | Search text or ticked values on the Boxes tab | Only matching boxes; the table's summary counts what is shown |

## Behavior

- "Painted" in the summary counts painted and done minis.
- Status badges are grey while a mini is unpainted, a lighter grey with
  each step, and gold from painted on (design system: gold means done).
- The search ignores case and needs no confirmation.
- The "Box" filter tells boxes apart, not names: boxes with the same name
  are separate values, each followed by the day it was added, e.g.
  "Boyz (2026) · 12 Oct 2026".
- Filter chips work like faceted filters: a chip opens a list of the values
  in the hoard with how many minis have each, searchable by typing. Ticked
  values of one chip are alternatives (any matches); different chips must
  all match, and so must the search. "Reset" clears all filters, not the
  search.
- Only the table sorts. Cards always show the rows sorted by army. The
  table starts sorted by faction; a click on a new column header sorts it
  ascending, a click on the current one switches between ascending and
  descending. Rows without a box sort after those with one.
- Selecting works like photo apps and mail clients: hovering a row or
  moving the keyboard focus to its check shows the check; ticking it starts
  selection mode. "Select" starts the mode without a pointer, e.g. on touch
  screens.
- In selection mode a click anywhere on a row selects or deselects it.
  Outside it, a click on a row will open the row for editing (not built
  yet), and a click on a box opens [Box](box.md). Returning from there
  keeps the Boxes tab's search, filters and view.
- "Select all" selects every row that is currently shown. "Done", and
  later every action on the selection, ends the mode and clears the
  selection.
- A box's progress follows the [domain rule](../domains/hoard.md#boxes-and-kits):
  untouched, started or done, and a percentage weighted by status. The bar
  is split by status in the colors of the status badges and always in the
  order of the pipeline (built, primed, painted, done), with small gaps
  between the parts. Minis on the sprue are no progress: they are the
  empty background of the bar and are not counted in the status line. The
  progress badge is grey until done and gold when done.
- The box search looks at the box name, the kit name, the article number
  and the tags. Progress values are ticked like statuses; a box matches a
  tag filter when it carries any of the ticked tags.
- Until the hoard comes from the server, the screen shows placeholder rows
  and boxes.
  "Add boxes" opens [Add box](add-box.md); "Add minis" and "Add custom"
  have no function yet.

## Accessibility

- Each checkbox is named after its row ("Select Boy").
- The count is announced as "{count} minis", "1 mini".
- Sortable table headers are buttons, and the current column carries
  `aria-sort`.
- The view switch marks the current view with `aria-pressed`.
- The name of each box, on its card and in its table line, is a button:
  it opens the box, or selects it in selection mode, so boxes open by
  keyboard as well.

## Test IDs

`hoard-summary`, `hoard-add-boxes`, `hoard-add-minis`, `hoard-add-custom`,
`hoard-tab-minis`, `hoard-tab-minis-count`, `hoard-tab-boxes`,
`hoard-select`, `hoard-view-cards`, `hoard-view-table`, `hoard-search`,
`hoard-filter-faction`, `hoard-filter-status`, `hoard-filter-box`, `hoard-filter-option`, `hoard-filter-reset`,
`hoard-table`, `hoard-sort-<column>`, `hoard-row`, `hoard-row-check`,
`hoard-row-menu`, `hoard-status`, `hoard-selection-bar`,
`hoard-selection-count`, `hoard-select-all`, `hoard-select-done`,
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
- Groups of minis are left out for now (domain doc); if they come, the
  screen gets them as a chip and a column.
- Filtering by a faction should include the factions that are part of it
  (domain doc); the placeholder rows only know faction names.
- What acting on selected rows offers, and how many minis of a row it
  picks.
- What the row menu ("⋮") offers.
- Starting selection mode with a long press on touch screens.
- What acting on selected boxes offers; what the box menu offers.
- Whether the box list should count "x of y" on its tab like the minis.
- Photos in place of the placeholder.
- Whether sorting by faction should follow the hierarchy of factions
  instead of the alphabet.
- Whether the chosen view should be remembered.
