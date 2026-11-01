# Use case: Add boxes from the catalog

- **ID:** ADD-BOXES
- **Status:** Draft
- **Screens:** [Add box](../screens/add-box.md), [Hoard](../screens/hoard.md)
- **Domain rules:** [hoard: Boxes and kits](../domains/hoard.md#boxes-and-kits),
  [catalog: Using catalog kits](../domains/catalog.md#using-catalog-kits)

## Goal

The user adds boxes they bought to the hoard by finding their kit in the
catalog, so the minis in them are there on the sprue, ready to be built.

## Not in scope

- Minis without a box: [Add minis](add-minis.md) and
  [Add custom minis](add-custom-minis.md).
- Sprues bought without their box: [Add sprues](add-sprues.md).
- Splitting a bundle by faction or kit in one step (later).
- Deciding what the minis become; that happens when they are built:
  [Build minis](build-minis.md) and
  [Build custom minis](build-custom-minis.md).
- Boxes of kits the catalog does not know, scanning barcodes and choosing
  existing tags (later).

## Requirements

### Requirement: Find a kit in the catalog

The system SHALL offer the catalog kits whose name, a variant's name,
product code or barcode contains the search, or whose slots can be built
as a name that contains it, and MUST NOT offer removed kits.

#### Scenario: Search by name (ADD-BOXES-01)

- **Given** the catalog kits "Boyz" from 2008 and from 2026
- **When** the user searches for "boyz"
- **Then** both are offered, told apart by the year of their first release

#### Scenario: Search by a variant's name (ADD-BOXES-02)

- **Given** the catalog kit "Lootas or Burna Boyz"
- **When** the user searches for "Burna"
- **Then** "Lootas or Burna Boyz" is offered

#### Scenario: Nothing matches (ADD-BOXES-03)

- **Given** no catalog kit matches the search
- **When** the user searches for it
- **Then** the user is told that no kits match, and nothing is offered

### Requirement: Add the boxes with their minis on the sprue

The system SHALL add as many boxes as the user counted, each named after
the kit with its year, with the kit's factions, the chosen tags, today as
the day it was added, and the minis its kit puts on the sprue, without
asking what they will be built as.

#### Scenario: A kit with one variant (ADD-BOXES-04)

- **Given** the user opened the catalog kit "Boyz" from 2026 with 11 minis
  and chose 2 boxes and the tag "Christmas"
- **When** the user adds them
- **Then** the hoard has 2 more boxes "Boyz (2026)" tagged "Christmas",
  added today, each with 11 minis on the sprue

#### Scenario: An either-or kit (ADD-BOXES-05)

- **Given** the user opened "Lootas or Burna Boyz"
- **When** the user adds 1 box
- **Then** the box "Lootas / Burna Boyz" has its undecided minis on the
  sprue named after the kit, and the minis every variant has alike under
  their own name

#### Scenario: A bundle (ADD-BOXES-06)

- **Given** the user opened a bundle that holds two other kits
- **When** the user adds 1 box
- **Then** the box has its own minis and those of both kits on the sprue,
  as if their boxes were added on their own

### Requirement: Change what the boxes hold

The system SHALL let the user change, before adding, how many minis each
row of the kit puts on the sprue, down to none, and the name of the
boxes; every box added gets the changed rows and name. A box whose rows
differ from its kit SHALL be an edited box. The system MUST NOT add boxes
without any mini.

#### Scenario: Fewer minis in a row (ADD-BOXES-09)

- **Given** the user opened a kit with a row of 10 Boys
- **When** the user lowers the row to 7 and adds 1 box
- **Then** the box has 7 Boys on the sprue and is marked as edited

#### Scenario: Several changed boxes (ADD-BOXES-10)

- **Given** the user lowered a row of 10 Boys to 7 and chose 2 boxes
- **When** the user adds them
- **Then** each of the 2 boxes has 7 Boys on the sprue, and both are
  marked as edited

#### Scenario: No minis left (ADD-BOXES-11)

- **Given** the user set every row of the kit to none
- **When** the user tries to add the box
- **Then** nothing can be added until a row has at least one mini

#### Scenario: Another name (ADD-BOXES-12)

- **Given** the user opened "Boyz" from 2026 and named the box "Boyz from
  Dad"
- **When** the user adds it
- **Then** the hoard has a box "Boyz from Dad", numbered among the boxes
  of that name

#### Scenario: Rows as the kit describes (ADD-BOXES-13)

- **Given** the user changed a row and set it back to the kit's count
- **When** the user adds the box
- **Then** the box is not marked as edited

### Requirement: Show what is already in the hoard

The system SHALL show for each kit how many boxes of it the user already
has, whichever version they were added from.

#### Scenario: Boxes of an older version (ADD-BOXES-07)

- **Given** the user has 2 boxes of "Boyz" from 2026, added from an older
  version of the kit
- **When** the user searches for "Boyz"
- **Then** the kit "Boyz" from 2026 shows 2 boxes in the hoard

### Requirement: Nothing is added on failure

The system MUST NOT add any box when adding fails, and SHALL keep what the
user chose.

#### Scenario: The server does not add (ADD-BOXES-08)

- **Given** the server can't add boxes
- **When** the user adds them
- **Then** the user is told that the boxes can't be added right now, no
  box is added, and the kit stays open with the chosen count and tags

## Open questions

- Whether the empty search shows recently used kits.
- Offering the user's existing tags once tags have a data model.
- How a kit not in the catalog is added as a box.
- Whether the search should also match factions and older names.
- Whether a renamed box keeps the kit's year in its name.
