# Screen: Add box

- **Route:** `/hoard/add/box`; adding minis and custom boxes get their own
  routes under `/hoard/add/` later
- **Domain:** `hoard`
- **Related:** [Hoard](hoard.md), [Domain: hoard](../domains/hoard.md),
  [Domain: catalog](../domains/catalog.md), [Shell](shell.md)

## Purpose

Adding a box the user bought to the hoard: find its kit in the catalog,
open it, and add one or more boxes of it with their minis on the sprue,
all on one screen.

## Layout

Inside the [shell](shell.md), one content column over the full width beside
the sidebar, as wide as the hoard, from top to bottom:

1. A back link "Hoard" with a left chevron, leading to the Boxes tab of
   the hoard; below it the title.
2. The search field and next to it a square button to scan a barcode.
3. After adding: the status bar (see Behavior).
4. A muted label and the kit cards, or the hint, the no-results message or
   the error in their place.

### Kit card, collapsed

A full-width bordered card on the card surface with rounded corners; the
whole header is one button that opens the card.

- Left: a 72 × 72 image tile with rounded corners, muted with diagonal
  stripes and a box icon. The catalog has no images, so every kit shows
  this placeholder.
- Middle, stacked: the name in semibold, for an either-or kit every
  variant's name joined with a muted "or", with the year of its first
  release after it in muted regular weight, followed by a dashed "Not
  checked" badge for draft catalog kits; the kit's factions; a smaller
  muted line with manufacturer and product code.
- Right, stacked and right-aligned: the number of minis; for an either-or
  kit a small muted line with a split icon and the number of builds; if the user
  already has boxes of the kit, how many, in gold. On narrow screens that
  line moves below the middle column, so the name keeps its room.

Texts are cut off with an ellipsis instead of wrapping.

### Kit card, open

The open card has a gold border. Below the header, without a further
border:

1. The minis the box puts on the sprue, one row each with the number of
   minis in a fixed column:
   - for a kit with one variant, one row per slot: the suggested names,
     then the parts as small muted chips in the same row, wrapping;
   - for an either-or kit, one row: the kit's name, below it a muted
     line with what each mini can become, and below that the parts of
     every variant as small muted chips, each part once;
   - for a bundle, after its own rows, the rows of every kit in it; a kit
     that comes twice shows twice the minis.
2. A border, then the tags: the tags typed in this card as toggle chips
   (fully rounded, `h-8`; on = gold border and light gold background), and
   a small dashed input for a new tag.
3. The last row: the box stepper, and pushed to the right the primary
   button. Both are `h-10`.

## Content

| Element | Text or content |
|---------|-----------------|
| Browser tab title | Add box · Greyhoarder |
| Back link | Hoard |
| Title | Add to hoard |
| Search placeholder | Name, product code or barcode |
| Search (accessible name) | Search kits |
| Scan button (accessible name) | Scan barcode |
| Hint | Search the catalog by name, product code or barcode. |
| List label | Matching kits |
| Kit name | {name} · {year}, e.g. "Boyz · 2026"; without a known year only the name. Either-or kits: {name} or {variant name} · {year}, e.g. "Lootas or Burna Boyz · 2008" |
| Draft badge | Not checked |
| Factions line | The kit's factions, joined with " · " |
| Release line | {manufacturer} · {product code}, leaving out the code when the kit has none |
| Minis | {n} minis, "1 mini"; for either-or kits with different sizes "{a} or {b} minis" |
| Builds | {n} builds, for either-or kits only |
| Boxes in the hoard | {n} boxes in your hoard, "1 box in your hoard" |
| Slot row | {count × boxes}× · the suggested names joined with " or " · the parts |
| Either-or row | {minis × boxes}× · {kit name}, e.g. "Lootas / Burna Boyz"; below: Each can become {every suggested name of every variant, joined with " or "}.; then the parts as chips |
| New tag (placeholder; accessible name) | + Tag; New tag |
| Box stepper | − {n} boxes +, "1 box"; buttons: One box less, One box more |
| Add button | Add {n} minis, "Add 1 mini" |
| Status bar | Added {n} boxes of {box name} with {m} minis to your hoard. · Show boxes · Dismiss (accessible name) |
| No results | No kits match "{query}". |
| Search failed | Can't search the catalog right now. Try again in a moment. |

## States

| State | When | What the user sees |
|-------|------|--------------------|
| Empty | The search field is empty | The hint in place of the list |
| Searching | Text in the search field | The catalog kits whose name, a variant's name, product code or barcode contains the text, at most 50, sorted by name |
| No results | The search matches no kit | The no-results message in place of the list |
| Failed | The server does not answer the search | The search-failed message in `destructive`, announced to screen readers |
| Open | A kit card was opened | Its form below its header; every other card is closed |
| Added | Boxes were added | The status bar below the search; all cards closed |

## Behavior

- The server searches the catalog; the search ignores case and needs no
  confirmation. Removed catalog kits are not offered.
- Only one card is open at a time; opening one closes the other, and
  opening it again closes it. A newly opened card starts with one box and
  no tags.
- Either-or variants of the same size count once: Gorkanaut / Morkanaut
  yields "1 mini".
- Kits marked as draft in the catalog are offered like any other, marked
  as not checked ([catalog](../domains/catalog.md#using-catalog-kits)).
- The name is the catalog's name as printed on the box. An either-or kit
  is shown and named by all of its variants, "Lootas or Burna Boyz", and a
  search for any of them finds it; boxes and minis join the names with a
  slash, "Lootas / Burna Boyz". Editions of a kit
  share it, so the year of the kit's first release (the oldest one in the
  catalog) tells them apart: "Boyz · 2008", "Boyz · 2021", "Boyz · 2026".
- The catalog names a manufacturer only by its folder; the screen shows it
  with capitalized words, e.g. "Games Workshop".
- The screen never asks what will be built; that is decided per mini when
  it is built ([hoard](../domains/hoard.md#boxes-and-kits)). The rows and
  the add button count the kit's minis times boxes. The stepper does not
  go below one box.
- Enter in the new-tag input adds the tag to the chips and selects it.
  Tags have no data model yet, so the card offers no existing tags; the
  chosen ones go onto the new boxes.
- Boxes record no price.
- Adding follows the [hoard](../domains/hoard.md#boxes-and-kits): one box
  per box counted, each named after the kit with its year ("Boyz (2026)",
  "Lootas / Burna Boyz (2008)"),
  with the kit's factions, the chosen tags, today as the day it
  was added, and the minis its kit puts on the sprue: for a kit with one
  variant one per mini in its slots, named after the first suggestion of
  its slot, with the slot's faction or else the kit's first one; for an
  either-or kit as many as the kit yields, named after the kit, with the
  kit's first faction; for a bundle also the minis of every kit in it, as
  if that kit's box were added on its own.
- After adding, the card closes and the status bar appears; "Show boxes"
  leads to the Boxes tab of the hoard, the cross hides the bar. The bar is
  announced to screen readers.
- A box counts as one of a kit when it was added from that kit, whichever
  version of it.
- Boxes and minis are kept in the client only for now; they are gone after
  a reload.
- Scanning has no function yet.

## Accessibility

- Each card header is a button with `aria-expanded` that controls its
  form.
- The tags are toggle buttons with
  `aria-pressed`.
- The new-tag input has a label for screen readers.
- The status bar and the box count are live regions.

## Test IDs

`add-box-back`, `add-box-search`, `add-box-scan`, `add-box-hint`,
`add-box-kit`, `add-box-kit-name`, `add-box-kit-year`, `add-box-kit-draft`,
`add-box-kit-minis`, `add-box-kit-builds`,
`add-box-kit-owned`, `add-box-slot`, `add-box-slot-builds`, `add-box-slot-count`,
`add-box-tag`, `add-box-new-tag`, `add-box-less`, `add-box-count`,
`add-box-more`, `add-box-submit`,
`add-box-added`, `add-box-added-show`, `add-box-added-dismiss`,
`add-box-no-results`, `add-box-error` (ADR-0013).

## Open questions

- The game system's name as a small badge on the card ("Warhammer
  40,000") and the faction's group in the factions line ("Orks · Xenos"):
  the kit search does not return either yet.
- Whether the empty search shows recently used kits once boxes are
  stored, and what counts as recently used: kits of the latest boxes, or
  also kits looked at.
- How building a mini suggests the names of every variant of its box's
  kit.
- Offering the user's existing tags once tags have a data model.
- Where users' own kits appear in the search, and how a kit not yet in the
  catalog or the user's kits is added.
- Whether the search should also match factions and older names.
- Scanning barcodes in the browser or only in the packaged apps.
