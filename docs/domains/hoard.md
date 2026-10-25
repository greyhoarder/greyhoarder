# Domain: hoard

- **Related:** [ADR-0019](../adr/0019-hobby-data-model.md),
  [ADR-0020](../adr/0020-community-kit-catalog.md),
  [catalog](catalog.md),
  [ADR-0010](../adr/0010-authorization-and-data-ownership.md),
  [Dashboard](../screens/dashboard.md)

## Purpose

The hoard is everything a user owns for the hobby: the boxes they bought,
the minis that came out of them, and where each mini stands on its way
from the sprue to the finished model. Every part of the hoard belongs to
exactly one user, and users see only their own hoard.

## Terms

| Term | Meaning |
|------|---------|
| **Mini** | One physical miniature, built or still on the sprue. The only thing with a hobby status. |
| **Box** | Something the user acquired that minis came out of: a kit, a starter set, a bundle. |
| **Tag** | A user's own label for boxes, e.g. "Gift", "Second hand", "Shelf of shame". |
| **Progress** | How far the minis of a box have come: untouched, started or done. |
| **Kit** | A template for what a box can become: its variants and, per variant, its slots. Either a user's own kit or a [catalog](catalog.md) kit. |
| **Variant** | One either-or outcome of a kit, e.g. "Lootas" or "Burna Boyz". Most kits have one. A box records none; what each mini becomes is decided when it is built. |
| **Slot** | A number of minis in a variant and what they can be built as, e.g. "9 × Boy or Boss Nob". |
| **Name** | What a mini was built as, in the user's words ("Boss Nob", "Tankbusta Rokkiteer"). |
| **Part** | A term from the user's vocabulary for something physically on a mini ("Big Shoota", "Power Klaw"). |
| **Counts as** | Optional free text saying what a mini stands in for on the table. |
| **Faction** | An army a mini belongs to: a [catalog](catalog.md) faction ("Dark Angels") or one of the user's own factions. |
| **Own faction** | A faction the user created, e.g. a custom successor chapter; it can be part of another faction. |
| **Status** | Where a mini stands: on the sprue, built, primed, painted, done. |
| **Workbench** | The minis the user is currently working on. |

## Rules

### Minis

- A mini always has a name, even on the sprue; its factions are optional;
  it never needs its box to be listed, found or edited.
- The status follows the order sprue → built → primed → painted → done.
  Any status can be set, also backwards (a mistake, a stripped mini).
- A mini may exist without a box (bought loose, second hand, already
  painted, 3D printed, kitbashed) and may start with any status.
- A mini has at most one box as its origin. Further origins of a kitbash
  go into its notes.

### Boxes and kits

- Adding a box from a kit never asks what will be built. It creates its
  minis on the sprue:
  - for a kit with one variant, one per mini in its slots, named after the
    first suggestion of its slot, with the slot's faction or else the
    kit's first one;
  - for an either-or kit, as many as the kit yields (for a catalog kit, its
    `minis`), named after the kit ("Lootas / Burna Boyz"), with the kit's
    first faction; except the minis of a slot that all of its variants
    have alike (same count, suggestions, parts and factions), which are
    created as for a kit with one variant (the Spanner of Lootas and
    Burna Boyz);
  - for a bundle, also the minis of every kit in it, created as if that
    kit's box were added on its own. A bundle with two boxes of Lootas
    gets their minis twice.
- What a mini becomes is decided when it is built, mini by mini. It is
  offered what the slots it was put on the sprue from can be built as,
  together with their parts: the undecided minis of an either-or kit the
  names of every variant, so one box can yield two Lootas and three Burna
  Boyz; a Boy of a bundle only what the Boy slot offers, not the names
  and parts of the other kits in it. Kits only suggest; any name and
  part can still be given.
- A mini keeps the name it got on the sprue as its sprue name, which never
  changes. A suggestion is used up by the minis of the box built as it,
  and by those built under a name of the user's own that had it on the
  sprue.
- A box from a catalog kit records the kit's id and version.
- A box without a kit is created with a name and at least one mini,
  added by hand.
- A box always has at least one mini. Deleting its last mini warns that
  the box is deleted with it.
- Kits only suggest. Any name and any part can be given to any mini, and a
  box may end up with more, fewer or other minis than its kit describes.
- Changing a kit never changes existing boxes or minis; neither does a
  new version of a catalog kit.
- A box records the day it was added (by default the day it is entered).
  It records no price.
- A box can carry any number of the user's tags. Each user has their own
  tags; renaming a tag renames it on every box.
- A box's progress is derived from its minis, never stored: untouched
  while all of them are on the sprue, done once all of them are painted
  (painted or done), started in between. The rule lives in the client's
  `hoard/models/`.
- A box's progress as a percentage counts each of its minis by its status
  in equal steps: on the sprue 0, built 25, primed 50, painted 75, done
  100; the box gets the rounded average. The rule lives in the client's
  `hoard/models/` as well.
- Deleting a box asks whether its minis go too. Minis that stay lose
  their origin and remain in the hoard.

### Factions

- A mini's factions are catalog factions or the user's own factions. They
  can be changed at any time; a box only suggests them.
- Each user has their own factions, like the vocabulary of parts: a name,
  any number of aliases for search and input, and optionally the faction
  it is part of (a catalog faction or another own faction), e.g. a
  successor chapter that is part of the Dark Angels.
- Renaming an own faction renames it on every mini.

### Parts

- Parts describe plastic, not rules. They are never checked against
  rules or kits.
- Each user has their own vocabulary of parts. A term has a name and
  any number of aliases (older names, other spellings) for search and
  input.
- Minis refer to terms, so renaming a term renames it on every mini.
- A part on a mini can be marked as swappable (magnetised).
- When choosing parts, the parts its kit suggests for the mini come first,
  then the rest of the vocabulary, then the parts of the catalog kits of
  its factions and the factions they are part of; a new term can be typed
  at any time. A part suggested by a catalog kit becomes a term of the
  user's vocabulary when it is first used.

### Workbench

- A mini is on the workbench only because the user put it there. Built,
  primed or painted alone does not put it there.
- Minis are put on the workbench singly or several at once.
- A mini leaves the workbench when the user takes it off, or when it
  reaches the last status (done).

## Life of a mini

1. The user adds a box of a kit. Its minis appear on the sprue, named
   after their slot.
2. While building, the user gives individual minis their names, parts
   and factions ("Boss Nob" with a power klaw; a Space Marine becomes a
   Crimson Wolf) and sets them to built, one by one or several at once.
3. The user puts some of them on the workbench.
4. Status changes move them through primed, painted and done; once done
   they leave the workbench.

## Lists of minis

Interfaces list minis, not boxes, wherever the hobby is concerned. Minis that are alike (same name, factions,
status, parts, each glued or swappable alike, notes and box, and all on the workbench or all off it) are shown as one row with a count ("Boy · on the
sprue · ×9"), from which the user picks how many to act on. As soon as a
mini differs, it gets its own row. The origin box is shown as a detail and
can be used as a filter, never as a level to navigate through.

A separate list of boxes shows what was bought: per box its kit, factions,
progress, how many minis are still on the sprue and how many are painted,
when it was added and its tags. It is an overview of purchases. A box can
be opened to see what it was added from, how far its minis have come and
the minis themselves, listed like every list of minis and edited the same
way as in the hoard. The lists of minis are still never browsed box by
box.

Filtering by faction depends on what the list is for:

- **Lists of the hoard and the workbench** show minis of that faction and
  of every faction that is part of it. "Dark Angels" shows Dark Angels
  and their successors, but no minis that are only Space Marines.
- **Starting a new model** for a faction offers every mini on the sprue
  that could become one: minis of that faction, of every faction it is
  part of, up the whole chain, and of its whole game system. Starting a
  Crimson Wolf (part of the Dark Angels) offers Crimson Wolves, Dark
  Angels, Space Marines and Warhammer 40,000 minis. The mini then gets
  the chosen faction in place of the one it had.

## Not part of this domain

- Rules data, datasheets, points and army lists. They may later refer to
  minis; the hoard never refers to them.
- The community kit catalog; it belongs to the [catalog](catalog.md)
  domain. Users' own kits stay in the hoard.
- Spare parts and leftover sprues.
- Painting recipes and paints.

## Open questions

- How tags are stored and managed (renaming, deleting); they have no data
  model yet.
- Whether minis can be grouped (a mob, a squad); left out for now.
- Whether `painted` should already take a mini off the workbench for users
  who do not base separately.
- Photos: how many per mini, and where files are stored.
- Whether statuses stay a fixed list or become configurable per user.
- What happens to minis when an own faction they use is deleted.
- The data model will change later for names of either-or kits: boxes,
  minis and sprue names store them joined with " / " ("Lootas / Burna
  Boyz"), which the screens show with "or" but search, and every other
  use of the stored text, sees with " / ". How they are stored instead is
  open.
- The data model will change soon for minis on the sprue: they will be
  handled apart from built minis instead of as minis with the status
  `sprue`. How they are stored and how building turns them into minis is
  open.
