# Screen: Add box

- **Route:** `/hoard/add/box`; adding minis and custom boxes get their own
  routes under `/hoard/add/` later
- **Domain:** `hoard`
- **Related:** [Hoard](hoard.md), [Domain: hoard](../domains/hoard.md),
  [Domain: catalog](../domains/catalog.md), [Shell](shell.md)

## Purpose

Adding a box the user bought to the hoard, in three steps: find its kit,
check what it contains, done. Only the first step is built so far.

## Layout

Inside the [shell](shell.md), one content column over the full width beside
the sidebar, as wide as the hoard, from top to bottom:

1. A back link "Hoard" with a left chevron, leading to the Boxes tab of
   the hoard; below it the title.
2. The steps as three segments of equal width: a bar with the numbered
   step name below it. The bars of the current and of earlier steps are
   gold, the others grey; the current step's name is bold.
3. Step 1, "Find the kit": the question as a heading, the search field and
   next to it a square button to scan a barcode, then a muted label and
   the kits.

A kit is a full-width bordered row on the card surface: the name, followed
by a dashed "Not checked" badge for draft catalog kits, with a meta line
below it; on the right the number of minis and a right chevron. Texts are
cut off with an ellipsis instead of wrapping.

## Content

| Element | Text or content |
|---------|-----------------|
| Browser tab title | Add box · Greyhoarder |
| Back link | Hoard |
| Title | Add to hoard |
| Steps | 1. Find the kit · 2. Check · 3. Done |
| Question | Which box did you get? |
| Search placeholder | Name, product code or barcode |
| Scan button (accessible name) | Scan barcode |
| List label | Recently used kits; while searching: Matching kits |
| Draft badge | Not checked |
| Kit meta line | {manufacturer} · {factions} · {year} · {product code}, leaving out what the kit doesn't have |
| Minis | {n} minis, "1 mini"; for either-or kits with different sizes "{a} or {b} minis" |
| No results | No kits match "{query}". |

## States

| State | When | What the user sees |
|-------|------|--------------------|
| Recent | The search field is empty | The kits the user added boxes from most recently, newest first |
| Searching | Text in the search field | Every kit whose name, product code or barcode contains the text |
| No results | The search matches no kit | The no-results message in place of the list |

## Behavior

- The search ignores case and needs no confirmation.
- Either-or variants of the same size count once: Gorkanaut / Morkanaut
  yields "1 mini".
- Kits marked as draft in the catalog are offered like any other, marked
  as not checked ([catalog](../domains/catalog.md#using-catalog-kits)).
- Until kits come from the server, the screen shows placeholder kits.
  Choosing a kit and scanning have no function yet; choosing a kit will
  lead to step 2.

## Accessibility

- The steps are an ordered list; the current one carries
  `aria-current="step"`.
- Each kit is a button.

## Test IDs

`add-box-back`, `add-box-step`, `add-box-search`, `add-box-scan`,
`add-box-kit`, `add-box-kit-draft`, `add-box-kit-minis`,
`add-box-no-results` (ADR-0013).

## Open questions

- What step 2 ("Check") and step 3 ("Done") show.
- Where users' own kits appear in the search, and how a kit not yet in the
  catalog or the user's kits is added.
- What "recently used" counts: kits of the latest boxes, or also kits
  looked at.
- Whether the search should also match factions and older names.
- Scanning barcodes in the browser or only in the packaged apps.
