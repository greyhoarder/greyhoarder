# ADR-0019: Hobby data model

- **Status:** Proposed
- **Date:** 2026-10-22

## Context

Greyhoarder tracks which boxes a user owns, the miniatures that came out of
them and where each one stands in the hobby pipeline (see `AGENTS.md`).
Boxes do not map cleanly to what ends up on the table:

- A box holds parts, not fixed models. In the Boyz kit one of ten can be
  built as a Boss Nob; an Intercessor box builds ten Intercessors, nine plus
  a Sergeant, or two squads of four plus a Sergeant.
- Some kits are either-or: Lootas or Burna Boyz, Gorkanaut or Morkanaut,
  one Mek Gun out of several sold under different names.
- Minis carry wargear that is glued, magnetised or swapped. Rules rename
  wargear, drop options and move models between datasheets with every
  edition; the plastic stays the same.
- Minis also arrive without a box: second hand, already painted, 3D
  printed, or kitbashed from several kits.

Users pick what to work on from their whole collection. Where a mini came
from is interesting, but must never be a step on the way to it.

Rules data and army lists come later and must not shape this model
(`AGENTS.md`). ADR-0005 expects product data as versioned reference data
that users do not create; no such catalog exists yet.

## Decision

- **The mini is the unit.** A mini is one physical miniature and the only
  thing that has a hobby status. Each mini is its own document, owned by
  its user (see ADR-0010).
- **Minis describe plastic, not rules.** What a mini was built as and which
  parts it carries are the user's words, taken from the user's own
  vocabulary of parts. There is no reference to rules data; a free-text
  "counts as" is the only bridge.
- **A box is an origin, not a container.** Adding a box creates its minis;
  afterwards each mini stands on its own and carries everything needed to
  find, list and edit it without its box. Minis without a box are normal.
- **Kits are suggestions.** A kit describes what a box can become: its
  either-or variants and, per variant, how many minis it yields and what
  they can be built as. Kits never validate; whatever the user built is
  right. For now, kits are created by users and owned like the rest of the
  hoard; they are not the product reference data of ADR-0005.
- **Grouping is the user's.** Minis are grouped into groups (a mob, a
  squad) independently of the boxes they came from.
- **The workbench is a choice.** A mini is on the workbench because the
  user put it there, not because of its status.

How these concepts behave in detail is described in `docs/domains/hoard.md`
and refined there without a new decision.

### Alternatives considered

- **A box with counts per status** ("10 Boyz: 6 built, 4 on the sprue"):
  compact and quick to enter, but a single mini cannot get its own name,
  parts, photos or workbench place without splitting the box into ad hoc
  sub-records.
- **Minis linked to rules data** (datasheets, wargear options from BSData):
  enables validation and list building, but every edition would rename or
  invalidate stored data, and the hoard would depend on rules data that is
  explicitly out of scope.
- **Kits that validate** (at most one Nob, only kit parts): protects
  against typos, but rejects kitbashes, spare parts and third-party bits,
  which are common.
- **The box as the entry point** (box → minis): mirrors the shelf, but
  makes the box a mandatory step for every action and has no place for
  minis without a box.
- **A shared kit catalog for the instance**: one household enters a kit
  once, but it needs its own ownership and editing rules beyond ADR-0010.
  It remains a later decision, possibly as reference data in the sense of
  ADR-0005.
- **Workbench derived from status** (everything past the sprue and not
  finished): no extra data, but every built mini would count as in
  progress, which is not how people work.

## Consequences

- Status, photos, parts and the workbench work per mini; lists of
  identical minis are bundled in the interface, not in the data.
- Adding a box of twenty minis writes twenty documents. At the expected
  volume (thousands per user) this does not matter; bulk actions in the
  interface keep editing quick.
- Edition changes need no migration: renaming a part is a change to one
  term in the user's vocabulary.
- Without validation, nothing stops impossible builds; the hoard records
  what is on the shelf, not what is legal.
- Rules data and army lists will reference minis and groups, never the
  other way round.
- Kits are entered by users; a shared or imported catalog needs a new
  decision.
