# Screen: Edit box

- **Route:** `/hoard/boxes/:id/edit`
- **Domain:** `hoard`
- **Use cases:** [Edit a box](../use-cases/edit-a-box.md)
- **Related:** [Box](box.md), [Add box](add-box.md),
  [Domain: hoard](../domains/hoard.md#boxes-and-kits), [Shell](shell.md)

## Purpose

Counting the minis on the sprue in a box, row by row of its kit. Nothing
is saved until the user saves.

## Layout

Inside the [shell](shell.md), one content column over the full width beside
the sidebar, as on [Edit minis](edit-minis.md), from top to bottom:

1. A back link "Box" with a left chevron.
2. The header: the title, and below it in `muted-foreground` what the page
   changes.
3. The rows of the box's kit as on the open kit card of
   [Add box](add-box.md#kit-card-open), each with a row stepper that counts
   the box's minis on the sprue of that row, also rows that have none.
4. The save bar, sticking to the bottom of the screen while scrolling,
   built like the apply bar of [Edit minis](edit-minis.md): on the left,
   while rows were lowered, the delete note in `destructive`; on the right
   "Cancel" (ghost) and "Save" (primary).

## Content

| Element | Text or content |
|---------|-----------------|
| Browser tab title | Edit box · Greyhoarder |
| Back link | Box |
| Title | Edit {box name} |
| Text | Count the minis on the sprue in this box. Built and gone minis stay as they are. |
| Row | − {n on the sprue} + · the suggested names joined with " or " · the parts, as on [Add box](add-box.md#content) |
| Row buttons (accessible names) | One fewer: {row name} · One more: {row name} |
| Delete note | {n} minis on the sprue will be deleted for good. — one: 1 mini on the sprue will be deleted for good. |
| Buttons | Cancel · Save |
| Failed | Can't save right now. Try again in a moment. |
| Not found | This box isn't in your hoard. |
| No kit | This box has no kit, so it can't be edited. |
| Load failed | Can't load this box right now. Try again in a moment. |

## States

| State | When | What the user sees |
|-------|------|--------------------|
| Loading | The hoard is loaded | The back link; skeletons in the shape of the header and the rows |
| Counting | The page is open | Each row at the number of the box's minis on the sprue of that row |
| Rows lowered | A row is below the number it started with | The delete note |
| Saving | "Save" pressed | The button shows the busy stripes until the server answers |
| Failed | The server does not save | The failed message in `destructive` in the save bar, announced to screen readers; the counted rows stay |
| Not found | The box is not in the user's hoard | The not-found message below the back link |
| No kit | The box has no kit | The no-kit message below the back link |
| Load failed | The server does not answer | The load-failed message in `destructive` below the back link, announced to screen readers |

## Behavior

- "Edit box" on the [box](box.md) opens this page. Each row starts at the
  number of the box's minis on the sprue of that row, goes from 0 up and
  has no upper limit.
- Nothing is saved until "Save". "Cancel", the back link and the browser's
  back button leave for the box and forget the changes, without asking.
- "Save" with unchanged rows only leads back to the box. Otherwise it puts
  further minis on the sprue as adding the box would, deletes minis on the
  sprue of lowered rows for good and marks the box as edited
  ([domain](../domains/hoard.md#boxes-and-kits)); then the page leads back
  to the box, which shows it as saved. When the box has no minis left
  afterwards, the box asks whether to delete it, as after deleting minis.

## Accessibility

- The page opens with the focus on the title.
- Each row stepper is a group named after its row; the delete note and the
  failed message are announced to screen readers.

## Test IDs

`box-edit-back`, `box-edit-title`, `box-edit-row`, `box-edit-less`,
`box-edit-more`, `box-edit-count`, `box-edit-delete-note`,
`box-edit-cancel`, `box-edit-save`, `box-edit-error`, `box-edit-none`,
`box-edit-no-kit`, `box-edit-load-error`, `box-edit-loading` (ADR-0013).
