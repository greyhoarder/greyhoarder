# Use case: See the armies of a box

- **ID:** BOX-ARMIES
- **Status:** Draft
- **Screens:** [Add box](../screens/add-box.md), [Box](../screens/box.md)
- **Domain rules:** [hoard: Lists of minis](../domains/hoard.md#lists-of-minis)

## Goal

In a box with minis of several armies, such as a two-player starter set,
the user sees at a glance which minis belong to which army, and can take
only one army, e.g. when sharing the box with a friend.

## Not in scope

- Splitting a box already in the hoard into a box per army (later).
- Grouping the gone minis of a box.
- Lists across boxes: [BROWSE](find-in-the-hoard.md).

## Requirements

### Requirement: Group by army where a box has several

The system SHALL list the minis of a box or kit under a heading per army
when they belong to more than one, and MUST NOT show headings when they
belong to one. A mini's army is its first faction; a row of a kit without
a faction of its own belongs to the kit's first faction.

#### Scenario: A kit of two armies (BOX-ARMIES-01)

- **Given** the kit Assault on Black Reach, with 17 Space Marines and 29
  Orks
- **When** the user opens it to add a box, or sees what it suggests on a
  box of it
- **Then** its rows are listed under "Space Marines · 17 minis" and
  "Orks · 29 minis"

#### Scenario: A kit of one army (BOX-ARMIES-02)

- **Given** the kit Boyz, with only Orks
- **When** the user opens it to add a box
- **Then** its rows are listed without a heading

#### Scenario: Counting a box of two armies (BOX-ARMIES-03)

- **Given** the user is adding a box of Assault on Black Reach
- **When** the user lowers the Warboss row to 0
- **Then** the row stays under its army and the heading says "Orks · 28
  minis"

### Requirement: Group the minis of a box

The system SHALL group the minis of a box by army, in "Minis" and in "On
the sprue" each, the armies in the order of the kit's factions, others by
name, and minis without a faction last under "No faction".

#### Scenario: Built and on the sprue (BOX-ARMIES-04)

- **Given** a box of Assault on Black Reach with 5 built Space Marines,
  12 Space Marines and 29 Orks on the sprue
- **When** the user opens the box
- **Then** "Minis" shows no army heading, and "On the sprue" shows
  "Space Marines · 12 minis" above "Orks · 29 minis"

#### Scenario: A mini without a faction (BOX-ARMIES-05)

- **Given** a box with built Orks and a built mini whose faction was
  removed
- **When** the user opens the box
- **Then** "Minis" shows "Orks · {count} minis" above "No faction · 1
  mini"

### Requirement: Take only one army of a kit

The system SHALL offer, when adding a box of a kit of several armies, the
whole box or only one of its armies, and SHALL hide the rows of the other
armies and set them to none.

#### Scenario: The armies of the kit (BOX-ARMIES-07)

- **Given** the kit Assault on Black Reach
- **When** the user searches for it
- **Then** its card says "Space Marines and Orks"; with three armies
  "Space Marines, Orks and Tau"

#### Scenario: Sharing a box (BOX-ARMIES-08)

- **Given** the kit Assault on Black Reach is open
- **When** the user chooses "Only Orks" and adds the box
- **Then** a box with the 29 Orks is added, marked as edited

#### Scenario: Back to the whole box (BOX-ARMIES-09)

- **Given** the user chose "Only Orks"
- **When** the user chooses "Whole box" or resets the rows
- **Then** all rows are back at what the kit puts on the sprue

## Open questions

- Whether a heading should select the minis of its army.
