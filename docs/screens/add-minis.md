# Screen: Add minis

- **Route:** `/hoard/add/minis`
- **Domain:** `hoard`
- **Use cases:** [Add minis from the catalog](../use-cases/add-minis.md)
- **Related:** [Hoard](hoard.md), [Add box](add-box.md),
  [Add custom](add-custom.md), [Domain: hoard](../domains/hoard.md),
  [Domain: catalog](../domains/catalog.md), [Shell](shell.md)

## Purpose

Adding minis without their box: bought loose, second hand or already
painted. The user finds a mini the catalog knows, says how many and how far
they have come, and adds them; minis of the same kind in different states
are added one after the other, all on one screen. Minis the catalog does not
know are put together on [Add custom](add-custom.md).

## Layout

Inside the [shell](shell.md), one content column over the full width beside
the sidebar, as wide as the hoard, from top to bottom:

1. A back link "Hoard" with a left chevron, leading to the Minis tab of
   the hoard; below it the title.
2. The search field.
3. After adding: the status bar (see Behavior).
4. A muted label and the mini cards, or the hint, the no-results message or
   the error in their place.

### Mini card, collapsed

A full-width bordered card on the card surface with rounded corners, built
like the kit card of [Add box](add-box.md#kit-card-collapsed); the whole
header is one button that opens the card.

- Left: a 72 × 72 image tile with rounded corners, muted with diagonal
  stripes.
- Middle, stacked: the name in semibold, followed by a dashed "Not checked"
  badge when its kit is a draft; the faction with its game system; a
  smaller muted line with the kit it comes from.
- Right: if the user already has minis of this name and faction that are
  not gone, how many, in gold.

Texts are cut off with an ellipsis instead of wrapping.

### Mini card, open

The open card has a gold border. Below the header, without a further
border:

1. The status: the label "Status" and one toggle chip per status, "On the
   sprue" to "Done"; exactly one is chosen.
2. The parts: the chosen parts as tiles like on [Mini](mini.md), each with
   its swappable switch and a remove button, then "Add a part", which opens
   the part picker below the tiles with the groups "From the kit" (the
   parts the catalog suggests for it), "Your parts" and the range of its
   faction, as on [Mini](mini.md).
3. The last row: the mini stepper, and pushed to the right the primary
   button. Both are `h-10`.

## Content

| Element | Text or content |
|---------|-----------------|
| Browser tab title | Add minis · Greyhoarder |
| Back link | Hoard |
| Title | Add minis |
| Search placeholder | Name of the mini, its kit or faction |
| Search (accessible name) | Search minis |
| Hint | Search the catalog for a mini by its name, the kit it comes in or its faction. |
| List label | Matching minis |
| Mini name | {name}, e.g. "Nob" |
| Draft badge | Not checked |
| Faction line | {faction} · {game system}, e.g. "Orks · Warhammer 40,000" |
| Kit line | From {kit} · {year}, e.g. "From Boyz · 2026" |
| Minis in the hoard | {n} in your hoard |
| Status label | Status |
| Status chips | On the sprue · Built · Primed · Painted · Done |
| Add part button | Add a part |
| Suggestion group | From the kit · {kit as in the kit line, without "From"}, e.g. "From the kit · Boyz · 2026" |
| Vocabulary group | Your parts |
| Range group | {faction} range, e.g. Orks range |
| Mini stepper | − {n} minis +, "1 mini"; buttons: One mini less, One mini more |
| Add button | Add {n} minis, "Add 1 mini" |
| Status bar | Added {n} × {name} ({status}) to your hoard. · Show minis · Dismiss (accessible name) |
| No results | No minis match "{query}". |
| Search failed | Can't search the catalog right now. Try again in a moment. |
| Add failed | Can't add the minis right now. Try again in a moment. |

## States

| State | When | What the user sees |
|-------|------|--------------------|
| Empty | The search field is empty | The hint in place of the list |
| Searching | Text in the search field | The catalog minis for which every word of the text is in their name, the name of a kit they come from or the name of their faction ("Ork Boy"), at most 50, the best matches first (see [catalog](../domains/catalog.md#using-catalog-kits)), then by name and faction |
| No results | The search matches no mini | The no-results message in place of the list |
| Failed | The server does not answer the search | The search-failed message in `destructive`, announced to screen readers |
| Open | A mini card was opened | Its form below its header; every other card is closed |
| Added | Minis were added | The status bar below the search; the card stays open with what was chosen |
| Add failed | The server does not add the minis | The add-failed message in `destructive` below the search, announced to screen readers; the card stays open with what was chosen |

## Behavior

- The server searches the catalog minis
  ([catalog](../domains/catalog.md#using-catalog-kits)); the search ignores
  case and needs no confirmation. Removed catalog kits are not offered.
- A catalog mini is a name that the slots of one catalog kit can be built
  as, for one faction: the slot's faction, or else each of its kit's
  factions. The same name for the same faction from another kit is
  another mini, so every kit is a result of its own ("Boy · Boyz · 2026",
  "Boy · Boyz · 2008"); its suggested parts are those of all its slots
  with that name, each once, in the order they first come.
- Only one card is open at a time; opening one closes the other, and
  opening it again closes it. A newly opened card starts with one mini,
  the status "Built" and no parts.
- The name and the faction come from the catalog and can't be changed
  here; a mini with another name is added on [Add custom](add-custom.md),
  and every mini can be renamed later on [Mini](mini.md).
- Parts are chosen as on [Mini](mini.md): a part from the catalog or a new
  term becomes a term of the user's vocabulary when the minis are added
  ([domain](../domains/hoard.md#parts)).
- Adding creates as many minis as counted, without a box, with the name,
  the faction, the kit, the chosen status and parts, off the workbench
  ([domain](../domains/hoard.md#minis)). Minis on the sprue without a box
  are listed in the Minis tab of the [hoard](hoard.md) like the others.
- After adding, the card stays open with what was chosen, so the same mini
  can be added again in another state; the status bar appears. "Show minis"
  leads to the Minis tab of the hoard, the cross hides the bar. The bar is
  announced to screen readers.
- The server adds the minis; the hoard is loaded again afterwards.
- The stepper does not go below one mini.

## Accessibility

- Each card header is a button with `aria-expanded` that controls its
  form.
- The status chips are a radio group named "Status".
- The status bar and the mini count are live regions.

## Test IDs

`add-minis-back`, `add-minis-search`, `add-minis-hint`, `add-minis-mini`,
`add-minis-mini-name`, `add-minis-mini-draft`, `add-minis-mini-faction`,
`add-minis-mini-kits`, `add-minis-mini-owned`, `add-minis-status`,
`add-minis-add-part`, `add-minis-less`, `add-minis-count`,
`add-minis-more`, `add-minis-submit`, `add-minis-added`,
`add-minis-added-show`, `add-minis-added-dismiss`, `add-minis-no-results`,
`add-minis-error`, `add-minis-add-error` (ADR-0013).

## Open questions

- The catalog names models by their short name within the kit ("Nob", not
  "Beast Snagga Nob"), so minis of different kits with the same short name
  and faction become one catalog mini.
- Whether added minis can be put on the workbench right away.
- Adding a mini to an existing box ("Add a mini to this box" on
  [Box](box.md)).
