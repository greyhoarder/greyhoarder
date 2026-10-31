# Screen: Edit minis

- **Route:** `/hoard/minis/edit?ids={id},{id},…`
- **Domain:** `hoard`
- **Use cases:** [Edit several minis at once](../use-cases/edit-several-minis.md)
- **Related:** [Hoard](hoard.md), [Box](box.md), [Mini](mini.md),
  [Domain: hoard](../domains/hoard.md), [Shell](shell.md)

## Purpose

Changing several selected minis in one go: their status, their workbench
place, their factions and, for minis of the same name, their parts. The
page shows what the minis have
now, values they don't share as mixed, and changes only what the user
touches; nothing is saved until the user applies the changes.

## Layout

Inside the [shell](shell.md), one content column over the full width beside
the sidebar, as wide as the hoard, from top to bottom:

1. A back link "Hoard", or "Box" when opened from a box, with a left
   chevron.
2. The header: the title, and below it in `muted-foreground` the minis
   with their counts, e.g. "Boy ×3, Nob ×2", followed by "· {n} gone"
   when gone minis are among them. Texts are cut off with an ellipsis.
3. The "Status" section: the label "Status" in small `muted-foreground`
   text; below it a segmented control "Built" to "Done", as on
   [Box](box.md#layout), with the chosen status on the `muted` surface.
   While the minis share a status, it is chosen; while they don't, none
   is, and a muted line says how they are mixed. A changed status shows a
   ghost button "Keep as it is" beside the control.
4. The "Workbench" section: the label "Workbench" and a segmented control
   "Keep · Put on · Take off" on the `muted` surface, "Keep" chosen at
   first; below it a muted line with how many are on the workbench now,
   and, while "Put on" is chosen and some minis can't go there, a line
   saying how many.
5. The "Factions" section: the heading "Factions"; below it one chip per
   faction any of the minis carries, as on [Mini](mini.md#layout), with
   "{k} of {n}" in muted text after the name unless all carry it, and a
   "×" to remove it; the dashed chip "+ Faction", which opens the faction
   search of [Mini](mini.md#layout). A faction to be removed shows its
   chip dashed and struck through, with "Undo" in place of the "×"; one to
   be added shows a muted "· added" and a "×" that takes it back.
6. The "Parts" section: the heading "Parts"; while the minis have
   different names, only a muted note below it. Otherwise, below it one
   tile per part any of the minis carries, built like the part tiles of
   [Mini](mini.md#layout), with "{k} of {n}" below the name unless all
   carry it; the swappable toggle reads "Mixed" while the minis carry the
   part glued and swappable. A part to be removed shows its tile dashed
   and struck through, with "Undo"; one to be added shows "added". The
   last tile is "Add a part", which opens the part picker of
   [Mini](mini.md#layout) without the group "From the kit".
7. The apply bar, sticking to the bottom of the screen while scrolling,
   built like the build bar of [Mini](mini.md#layout): the summary of the
   changes on the left; on the right "Cancel" (ghost) and the primary
   button.

Sections have no card of their own and are separated by space, as on
[Mini](mini.md#layout).

## Content

| Element | Text or content |
|---------|-----------------|
| Browser tab title | Edit minis · Greyhoarder |
| Back link | Hoard · Box |
| Title | Edit {n} minis |
| Minis line | {name} ×{count}, joined with ", "; one of a name without count; then · {n} gone |
| Status label | Status |
| Status control | Built · Primed · Painted · Done |
| Mixed status | Mixed: {count} {status}, … in pipeline order, e.g. "Mixed: 3 built, 2 primed" |
| Keep button | Keep as it is |
| Workbench label | Workbench |
| Workbench control | Keep · Put on · Take off; group named "Workbench" |
| Workbench now | {k} of {n} on the workbench · None on the workbench · All on the workbench |
| Workbench note | {k} of them can't go on the workbench: done or gone. — one: 1 of them can't … |
| Factions heading | Factions |
| Faction share | {k} of {n} |
| Faction chip buttons (accessible names) | Remove {faction} · Undo removing {faction} · Don't add {faction} |
| Added mark | · added (factions) · added (parts) |
| Parts heading | Parts |
| Parts note | Parts can be edited only for minis of the same name. |
| Part share | {k} of {n} |
| Mixed toggle | Mixed |
| Part tile buttons (accessible names) | Remove {part} · Undo removing {part} · Don't add {part} |
| Summary | Nothing changed yet. — otherwise the changes, e.g. "Status, workbench, 1 faction and 2 parts change on 5 minis." |
| Cancel | Cancel |
| Apply button | Apply to {n} minis; disabled while nothing changed |
| Applying | Applying… |
| Applied (on the page returned to) | Changed {n} minis. |
| Some missing | {k} of the selected minis are no longer in your hoard and are left out. |
| None found | None of these minis is in your hoard. |
| Load failed | Can't load these minis right now. Try again in a moment. |
| Apply failed | Can't change the minis right now. Try again in a moment. |

## States

| State | When | What the user sees |
|-------|------|--------------------|
| Loading | The hoard is loaded | The back link; skeletons in the shape of the header and the sections |
| Unchanged | The page is open and nothing was changed | Every section as the minis have it; "Nothing changed yet."; the apply button disabled |
| Changed | Something was changed | The changed parts marked as described in Layout; the summary lists the changes; the apply button enabled |
| Mixed status | The minis don't share a status | No status chosen; the mixed line |
| Different names | The minis don't share a name | The parts note in place of the tiles; parts can't be changed |
| Some missing | Ids of the address are not in the user's hoard | The some-missing message below the header; the page for the others |
| None found | No id of the address is in the user's hoard, also those of another user | The none-found message below the back link; no sections, no apply bar |
| Applying | The apply button pressed | The button shows the busy stripes and "Applying…" until the server answers |
| Apply failed | The server does not apply | The apply-failed message in `destructive` in the apply bar, announced to screen readers; every change stays |
| Load failed | The server does not answer | The load-failed message in `destructive` below the back link, announced to screen readers |

## Behavior

- "Edit" in the selection bar of the [hoard](hoard.md) or of a
  [box](box.md) opens this page for the selected minis; their ids go into
  the address, so the page can be reloaded and the browser's back button
  works.
- Gone minis are edited like the others
  ([use case](../use-cases/edit-several-minis.md)); minis on the sprue
  can't be selected.
- Only what the user changes is applied; everything else stays as each
  mini has it. Choosing a status sets it on every mini; "Keep as it is"
  takes the choice back. Factions and parts are added to or removed from
  each mini, never replaced as a whole: a part added to a mini that
  carries it already is kept once, glued or swappable as chosen on the
  tile.
- "Put on" puts every mini on the workbench that may go there: not done,
  not gone, and not set to done on this page
  ([domain](../domains/hoard.md#workbench)). "Take off" takes every mini
  off. Setting the status to done takes the minis off the workbench in any
  case.
- The faction search and the part picker work as on
  [Mini](mini.md#behavior); a new own faction or a new part is created
  when the changes are applied, and own factions and parts that no mini
  carries any more afterwards are removed
  ([domain](../domains/hoard.md#parts)).
- Nothing is saved before "Apply to {n} minis". Applying changes all
  minis together, or none of them when the server does not answer. Then
  the page leads back to where it was opened from, the selection there
  has ended, and the hoard or the box says "Changed {n} minis." in its
  status bar.
- "Cancel", the back link and the browser's back button leave without
  changing anything, and without asking.

## Accessibility

- The status control is a radio group named "Status"; while mixed, none
  is checked.
- The workbench control is a radio group named "Workbench".
- Each chip and tile button is named as in Content; a struck-through
  faction or part is announced as "to be removed".
- The summary is a live region; the apply-failed, some-missing and
  load-failed messages are announced to screen readers.

## Test IDs

`edit-minis-back`, `edit-minis-title`, `edit-minis-names`,
`edit-minis-status`, `edit-minis-status-mixed`, `edit-minis-status-keep`,
`edit-minis-workbench` (with `data-choice`), `edit-minis-workbench-now`,
`edit-minis-workbench-note`, `edit-minis-faction`,
`edit-minis-faction-share`, `edit-minis-faction-remove`,
`edit-minis-add-faction`, `edit-minis-part`, `edit-minis-part-share`,
`edit-minis-part-remove`, `edit-minis-part-swappable`,
`edit-minis-parts-note`,
`edit-minis-add-part`, `edit-minis-summary`, `edit-minis-cancel`,
`edit-minis-apply`, `edit-minis-apply-error`, `edit-minis-missing`,
`edit-minis-none`, `edit-minis-error`, `edit-minis-loading` (ADR-0013).

## Open questions

- Whether "On the sprue" is offered for minis of a box (see the
  [use case](../use-cases/edit-several-minis.md#open-questions)).
- A limit on how many minis fit into the address.
