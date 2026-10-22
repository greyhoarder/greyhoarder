# Screen: Hoard

- **Route:** `/hoard`
- **Domain:** `hoard`
- **Related:** [Domain: hoard](../domains/hoard.md),
  [ADR-0019](../adr/0019-hobby-data-model.md), [Shell](shell.md)

## Purpose

The overview of everything a user owns: every mini with its status, found
by name, part or box. It lists minis, not boxes; alike minis share a
row (see [Lists of minis](../domains/hoard.md#lists-of-minis)).

## Layout

Inside the [shell](shell.md), one centered content column (`max-w-6xl`),
from top to bottom:

1. Header: title and summary on the left; on the right one button per way
   into the hoard: "Add boxes" (primary), "Add minis" and "Add custom"
   (outline).
2. Tab bar over the full width with a bottom border: the tabs "Minis" and
   "Boxes" with their counts as badges, the active one underlined in gold;
   on the right, for the Minis tab, the "Select" button (ghost) and the
   view switch with "Cards" and "Table".
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
| Status badge | On the sprue / Built / Primed / Painted / Based |
| Count | ×{count} |
| Row check (accessible name) | Select {name} |
| Row menu (accessible name) | More actions |
| No results | No minis match "{query}". — without a search: No minis match the filters. |
| Boxes tab (for now) | The list of boxes comes later. |

## States

| State | When | What the user sees |
|-------|------|--------------------|
| List | The hoard has minis | Cards, sorted by army |
| Table | "Table" in the view switch | The same rows as a table, at first sorted by faction |
| Searching | Text in the search field | Only rows whose name, a part or the box contains the text; the tab counts what is shown |
| Filtered | Values ticked in a filter chip | Only matching rows; the chip shows up to two ticked values as badges after a divider, more as "{n} selected"; "Reset" appears |
| No results | Search and filters match nothing | The no-results message in place of the list |
| Not selecting | Initially, or after "Done" | No checks, except on the row under the pointer or with keyboard focus; no selection bar |
| Selecting | "Select" pressed, or a row's check ticked | Every row shows its check; the selection bar appears; "Select" is disabled |
| Selected | A row is selected | Its check is filled gold; a card gets a gold border, a table line a faint gold background |
| Boxes | The "Boxes" tab is active | For now, the placeholder text |

## Behavior

- "Painted" in the summary counts painted and based minis.
- Status badges are grey while a mini is unpainted, a lighter grey with
  each step, and gold from painted on (design system: gold means done).
- The search ignores case and needs no confirmation.
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
  yet).
- "Select all" selects every row that is currently shown. "Done", and
  later every action on the selection, ends the mode and clears the
  selection.
- Until the hoard comes from the server, the screen shows placeholder rows.
  The add buttons have no function yet.

## Accessibility

- Each checkbox is named after its row ("Select Boy").
- The count is announced as "{count} minis".
- Sortable table headers are buttons, and the current column carries
  `aria-sort`.
- The view switch marks the current view with `aria-pressed`.

## Test IDs

`hoard-summary`, `hoard-add-boxes`, `hoard-add-minis`, `hoard-add-custom`,
`hoard-tab-minis`, `hoard-tab-minis-count`, `hoard-tab-boxes`,
`hoard-select`, `hoard-view-cards`, `hoard-view-table`, `hoard-search`,
`hoard-filter-faction`, `hoard-filter-status`, `hoard-filter-box`, `hoard-filter-option`, `hoard-filter-reset`,
`hoard-table`, `hoard-sort-<column>`, `hoard-row`, `hoard-row-check`,
`hoard-row-menu`, `hoard-status`, `hoard-selection-bar`,
`hoard-selection-count`, `hoard-select-all`, `hoard-select-done`,
`hoard-no-results` (ADR-0013).

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
- What the "Boxes" tab shows.
- Photos in place of the placeholder.
- Whether sorting by faction should follow the hierarchy of factions
  instead of the alphabet.
- Whether the chosen view should be remembered.
