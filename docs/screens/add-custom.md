# Screen: Add custom

- **Route:** `/hoard/add/custom`
- **Domain:** `hoard`
- **Related:** [Hoard](hoard.md), [Add minis](add-minis.md),
  [Mini](mini.md), [Domain: hoard](../domains/hoard.md),
  [Domain: catalog](../domains/catalog.md), [Shell](shell.md)

## Purpose

Adding minis the user put together: kitbashes, conversions, 3D prints or
minis of other manufacturers. The user gives them a name, factions and
parts of their own, helped by names and parts already in the hoard and the
catalog, and adds as many as they have.

## Layout

Inside the [shell](shell.md), one content column over the full width beside
the sidebar, as wide as the hoard, from top to bottom:

1. A back link "Hoard" with a left chevron, leading to the Minis tab of
   the hoard; below it the title.
2. After adding: the status bar (see Behavior).
3. One bordered card on the card surface with rounded corners holding the
   form, its fields stacked with a label each:
   1. The name: a text field; while typing, a list of suggestions below it
      with the groups "Your minis" and "From the catalog".
   2. The factions: the chosen factions as chips with a "×" each, and a
      dashed chip "+ Faction", which opens a search over the catalog
      factions in a popover below it: the search field, and below it the
      factions found, one per line.
   3. The status: one toggle chip per status, "Built" to "Done"; exactly
      one is chosen.
   4. The parts: the chosen parts as tiles like on [Mini](mini.md), then
      "Add a part", which opens the part picker below the tiles with the
      groups "Your parts" and the range of the chosen factions.
   5. The notes: a text area.
   6. The last row: the mini stepper, and pushed to the right the primary
      button. Both are `h-10`.

## Content

| Element | Text or content |
|---------|-----------------|
| Browser tab title | Add custom · Greyhoarder |
| Back link | Hoard |
| Title | Add custom minis |
| Name label | Name |
| Name placeholder | What you built, e.g. Tankbusta Rokkiteer |
| Name suggestion groups | Your minis · From the catalog |
| Catalog suggestion | {name} · {faction} |
| Factions label | Factions |
| Faction chip | {faction} |
| Add faction chip | + Faction |
| Faction search placeholder | Search factions |
| Faction result | {faction} · {game system} |
| Faction search empty | Type a faction name. |
| No factions found | No factions match. |
| Status label | Status |
| Status chips | Built · Primed · Painted · Done |
| Parts label | Parts |
| Add part button | Add a part |
| Vocabulary group | Your parts |
| Range group | {faction} range, for the first chosen faction |
| Notes label | Notes |
| Notes placeholder | Kitbash sources, what is still to do |
| Mini stepper | − {n} minis +, "1 mini"; buttons: One mini less, One mini more |
| Add button | Add {n} minis, "Add 1 mini" |
| Status bar | Added {n} × {name} ({status}) to your hoard. · Show minis · Dismiss (accessible name) |
| Name missing | Give the minis a name. |
| Add failed | Can't add the minis right now. Try again in a moment. |

## States

| State | When | What the user sees |
|-------|------|--------------------|
| New | The screen is opened | An empty name, no factions, the status "Built", no parts, no notes, one mini |
| Suggesting | Text in the name field | The suggestions whose name contains the text, at most 10 per group; a group without matches is left out |
| Choosing a faction | "+ Faction" pressed | The faction search in a popover below "+ Faction", the field focused; Escape or a click outside closes it |
| Name missing | "Add" pressed with an empty name | The name-missing message below the name field, announced to screen readers; nothing is added |
| Added | Minis were added | The status bar above the card; the form keeps what was chosen |
| Add failed | The server does not add the minis | The add-failed message in `destructive` above the card, announced to screen readers; the form keeps what was chosen |

## Behavior

- Any name can be typed; the suggestions only help. "Your minis" offers
  the names of the minis in the hoard, each once; "From the catalog" the
  names of the catalog minis ([Add minis](add-minis.md#behavior)) with
  their faction. Choosing a suggestion fills in the name only.
- The faction search ignores case and matches the faction's name; choosing
  a faction adds it as a chip and closes the search. A mini may have no
  faction ([domain](../domains/hoard.md#minis)).
- Custom minis start built or further: what the user put together is no
  longer on the sprue ([domain](../domains/hoard.md#minis)).
- Parts are chosen as on [Mini](mini.md): from the vocabulary, from the
  range of the chosen factions, or typed as a new term, which becomes a
  term of the user's vocabulary when the minis are added
  ([domain](../domains/hoard.md#parts)).
- Adding creates as many minis as counted, without a box, with the name,
  factions, status, parts and notes, off the workbench.
- After adding, the form keeps what was chosen, so the same mini can be
  added again in another state; the status bar appears. "Show minis" leads
  to the Minis tab of the hoard, the cross hides the bar. The bar is
  announced to screen readers.
- The server adds the minis; the hoard is loaded again afterwards.
- The stepper does not go below one mini.

## Accessibility

- The name field is a combobox: the suggestions are a listbox, chosen with
  the arrow keys and Enter, closed with Escape.
- Each faction chip's "×" is named "Remove {faction}".
- The status chips are a radio group named "Status".
- The status bar and the mini count are live regions.

## Test IDs

`add-custom-back`, `add-custom-name`, `add-custom-name-suggestion`,
`add-custom-name-missing`, `add-custom-faction`, `add-custom-faction-remove`,
`add-custom-add-faction`, `add-custom-faction-search`,
`add-custom-faction-result`, `add-custom-status`, `add-custom-add-part`,
`add-custom-notes`, `add-custom-less`, `add-custom-count`,
`add-custom-more`, `add-custom-submit`, `add-custom-added`,
`add-custom-added-show`, `add-custom-added-dismiss`, `add-custom-add-error`
(ADR-0013).

## Open questions

- Offering the user's own factions once they have a data model.
- Whether added minis can be put on the workbench right away.
- Photos of custom minis.
