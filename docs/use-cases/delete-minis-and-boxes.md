# Use case: Delete minis and boxes

- **ID:** DELETE
- **Status:** Draft
- **Screens:** [Hoard](../screens/hoard.md), [Box](../screens/box.md),
  [Mini](../screens/mini.md)
- **Domain rules:** [hoard: Boxes and kits](../domains/hoard.md#boxes-and-kits),
  [hoard: Leaving the hoard](../domains/hoard.md#leaving-the-hoard)

## Goal

The user removes minis or boxes that were entered by mistake, for good, so
they no longer appear anywhere; boxes left without minis are removed only
if the user says so.

## Not in scope

- Minis that were sold, given away, stripped, lost or broken: they leave
  the hoard and keep their record, [LEAVE](leave-the-hoard.md).
- Finding and selecting the minis: [BROWSE](find-in-the-hoard.md).

## Requirements

### Requirement: Delete minis only after confirming

The system SHALL delete minis for good only after the user confirmed it,
and MUST NOT delete their box with them.

#### Scenario: Selected minis (DELETE-01)

- **Given** the user selected 2 Boyz and a Nob in the hoard
- **When** the user deletes them and confirms
- **Then** the 3 minis are gone for good, also from their boxes, the
  selection ends, and their boxes stay

#### Scenario: Not confirmed (DELETE-02)

- **Given** the user selected minis and chose to delete them
- **When** the user cancels
- **Then** nothing is deleted and the minis stay selected

#### Scenario: One mini (DELETE-03)

- **Given** the user opened a built mini of a box that has other minis
- **When** the user deletes it and confirms
- **Then** the mini is deleted and its box is shown; a mini without a box
  leads to the minis of the hoard instead

#### Scenario: Minis on the sprue (DELETE-04)

- **Given** a box with 10 Boyz on the sprue
- **When** the user deletes 3 of them
- **Then** the box has 7 Boyz on the sprue

### Requirement: Ask about boxes left without minis

The system SHALL ask once, after deleting minis, whether to delete the
boxes that have no minis left, gone ones included, and SHALL keep them as
empty boxes unless the user deletes them.

#### Scenario: The last minis of two boxes (DELETE-05)

- **Given** the user deletes every mini of two boxes
- **When** asked, the user deletes the boxes as well
- **Then** both boxes are deleted

#### Scenario: Keeping the box (DELETE-06)

- **Given** the user deleted the last mini of a box
- **When** asked, the user keeps the box
- **Then** the box stays and shows "Empty" in place of its progress

#### Scenario: A gone mini is left (DELETE-07)

- **Given** a box with one built and one sold mini
- **When** the user deletes the built mini
- **Then** the user is not asked about the box, which shows "All gone"

### Requirement: Delete a box, with or without its minis

The system SHALL ask whether the minis of a box go with it when the user
deletes the box, and SHALL either delete the box with all its minis, gone
ones included, or only the box, keeping its minis in the hoard without a
box and with the box's kit.

#### Scenario: Deleting a box with its minis (DELETE-08)

- **Given** a box with built, gone and on-the-sprue minis
- **When** the user deletes the box with its minis
- **Then** the box and all its minis are gone for good, and the list of
  boxes is shown

#### Scenario: Keeping the minis of a deleted box (DELETE-11)

- **Given** a box of Boyz (2026) with 2 built Boyz and 8 Boyz on the
  sprue
- **When** the user deletes the box and keeps its minis
- **Then** the box is gone, the 10 Boyz stay in the hoard without a box,
  and building one of them still suggests the names of the Boyz kit

### Requirement: Deleted minis leave no traces

The system SHALL remove deleted minis from the sources and recipients of
parts of other minis.

#### Scenario: A deleted recipient (DELETE-09)

- **Given** a Boy stripped for parts that went to a Nob
- **When** the user deletes the Nob
- **Then** the Boy no longer names the Nob as a recipient

### Requirement: Nothing is deleted on failure

The system MUST NOT delete anything when deleting fails.

#### Scenario: The server does not delete (DELETE-10)

- **Given** the server can't delete
- **When** the user confirms deleting minis or a box
- **Then** the user is told that it can't be deleted right now, and
  nothing is deleted

## Open questions

- The app deletes a box with all its minis without asking yet
  (DELETE-11 is new).
- Deleting a box from the "⋮" menu of the list of boxes: the menu has no
  entries yet.
