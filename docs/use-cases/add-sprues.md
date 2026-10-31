# Use case: Add sprues bought without their box

- **ID:** ADD-SPRUES
- **Status:** Draft
- **Screens:** [Add box](../screens/add-box.md) for sprues,
  [Hoard](../screens/hoard.md)
- **Domain rules:** [hoard: Boxes and kits](../domains/hoard.md#boxes-and-kits),
  [hoard: Minis](../domains/hoard.md#minis),
  [catalog: Using catalog kits](../domains/catalog.md#using-catalog-kits)

## Goal

The user adds sprues bought without their box, online or second hand, by
finding the kit they come from, also by a model on them, and counting the
minis they have, so they are on the sprue in a box of their own, ready to
be built like the minis of any box.

## Not in scope

- Whole boxes: [ADD-BOXES](add-boxes.md).
- Minis bought built or further: [ADD-MINIS](add-minis.md),
  [ADD-CUSTOM](add-custom-minis.md).
- A sprue that turns up later for a box the user has:
  [EDIT-BOX](edit-a-box.md).
- Splitting a bundle by faction or kit in one step, and sprues of several
  kits in one box (later; until then one box per kit).

## Requirements

### Requirement: Find the kit, also by a model

The system SHALL offer the catalog kits and bundles as
[ADD-BOXES](add-boxes.md) does, also those whose slots, or those of the
kits in them, can be built as a name that contains the search, and SHALL
show the slots that match.

#### Scenario: Search by a model (ADD-SPRUES-01)

- **Given** the catalog kit "Boyz", whose slot can be built as "Boy" or
  "Boss Nob", and a starter set that holds "Boyz"
- **When** the user searches for "Nob"
- **Then** "Boyz" and the starter set are offered, each showing the slot
  "Boy or Boss Nob"

#### Scenario: Nothing matches (ADD-SPRUES-02)

- **Given** no catalog kit matches the search
- **When** the user searches for it
- **Then** the user is told that no kits match, and nothing is offered

### Requirement: Count the minis from none

The system SHALL start every row of the chosen kit at none and MUST NOT
add anything before a row has at least one mini.

#### Scenario: Nothing counted yet (ADD-SPRUES-03)

- **Given** the user opened "Boyz"
- **When** the user has not counted any minis
- **Then** every row shows none, and nothing can be added

### Requirement: Add the sprues as one box of sprues

The system SHALL add one box per adding, with the counted minis on the
sprue named as adding the box would, the kit's factions, the chosen
name, day and tags, marked as sprues and not as an edited box.

#### Scenario: Part of a starter set (ADD-SPRUES-04)

- **Given** the user opened a starter set and counted 10 in the row of
  Boys and 1 in the row of the Warboss, leaving the rows of the other
  faction at none
- **When** the user adds them
- **Then** the hoard has one box more, named after the starter set and
  marked as sprues, with 10 Boys and 1 Warboss on the sprue and nothing
  of the other faction

#### Scenario: An either-or kit (ADD-SPRUES-05)

- **Given** the user opened "Lootas or Burna Boyz" and counted 3 undecided
  minis
- **When** the user adds them
- **Then** the box has 3 minis "Lootas / Burna Boyz" on the sprue, and
  building one offers "Loota" and "Burna Boy"

#### Scenario: A name of the user's own (ADD-SPRUES-06)

- **Given** the user named the sprues "Orks from the flea market"
- **When** the user adds them
- **Then** the box is named "Orks from the flea market"

### Requirement: The next kit of the same purchase

The system SHALL tell the user that the box was added and let them find
the next kit right away.

#### Scenario: A second kit (ADD-SPRUES-07)

- **Given** the user added sprues of "Boyz"
- **When** the user searches for "Lootas"
- **Then** the user sees that the Boyz were added, and can add the
  Lootas as a box of their own

### Requirement: Nothing is added on failure

The system MUST NOT add any box when adding fails, and SHALL keep what
the user chose.

#### Scenario: The server does not add (ADD-SPRUES-08)

- **Given** the server can't add boxes
- **When** the user adds the sprues
- **Then** the user is told that they can't be added right now, no box is
  added, and the kit stays open with the counted rows, name and tags

## Open questions

- None yet.
