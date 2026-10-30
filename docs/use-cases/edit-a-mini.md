# Use case: Edit a mini

- **ID:** EDIT-MINI
- **Status:** Draft
- **Screens:** [Mini](../screens/mini.md), [Hoard](../screens/hoard.md)
- **Domain rules:** [hoard: Minis](../domains/hoard.md#minis),
  [hoard: Factions](../domains/hoard.md#factions),
  [hoard: Parts](../domains/hoard.md#parts),
  [hoard: Lists of minis](../domains/hoard.md#lists-of-minis)

## Goal

The user corrects or updates what one mini is after it was built, its
name, parts, factions and notes, also when it has left the hoard, without
changing the minis alike to it.

## Not in scope

- Minis on the sprue, whose changes wait for building:
  [BUILD](build-minis.md), [BUILD-CUSTOM](build-custom-minis.md).
- Status and workbench: [PROGRESS](track-progress.md).
- Editing several minis at once (later).
- Leaving the hoard and coming back: [LEAVE](leave-the-hoard.md).
- Photos and changing the origin box (later).

## Requirements

### Requirement: Save at once, for this mini only

The system SHALL save each change at once and only for the mini opened;
the notes when the user leaves the field.

#### Scenario: One of alike minis (EDIT-MINI-01)

- **Given** a group of 2 alike Boys
- **When** the user gives one of them a "Big Shoota"
- **Then** only that mini carries it, without a further confirmation, and
  the hoard lists it apart from the other Boy

#### Scenario: Notes (EDIT-MINI-02)

- **Given** the user typed notes for a built mini
- **When** the user leaves the notes field
- **Then** the notes are saved, and the user is told that all changes are
  saved

### Requirement: Rename

The system SHALL let the user rename a built mini to a name its kit
suggests or to a name of their own.

#### Scenario: An own name (EDIT-MINI-03)

- **Given** a built "Boy"
- **When** the user types "Tankbusta" as its own name and presses Enter
- **Then** the mini is named "Tankbusta"

### Requirement: Change the parts

The system SHALL let the user remove parts, switch them between glued and
swappable, and add parts from the kit, the vocabulary, the range of the
mini's factions, or as a new term. A term that no mini carries any more,
gone ones included, MUST leave the vocabulary.

#### Scenario: Swappable (EDIT-MINI-04)

- **Given** a mini with a glued "Power Klaw"
- **When** the user switches it to swappable
- **Then** the mini carries a swappable "Power Klaw", and the hoard lists
  it apart from minis with a glued one

#### Scenario: A new part (EDIT-MINI-05)

- **Given** "Rokkit pack" is not in the user's vocabulary
- **When** the user creates it on a built mini
- **Then** the mini carries it, and it is offered under the user's own
  parts

#### Scenario: The last one carrying a part (EDIT-MINI-06)

- **Given** only one mini carries "Rokkit pack"
- **When** the user removes it from that mini
- **Then** "Rokkit pack" is no longer offered under the user's own parts

### Requirement: Change the factions

The system SHALL let the user add catalog and own factions, create a new
own faction by its name, and remove factions, down to none. An own faction
that no mini carries any more, gone ones included, MUST be deleted.

#### Scenario: A new own faction (EDIT-MINI-07)

- **Given** a built Space Marine
- **When** the user creates the faction "Crimson Wolves" on it
- **Then** the mini carries "Crimson Wolves", marked as the user's own

#### Scenario: The last one carrying an own faction (EDIT-MINI-08)

- **Given** only one mini carries "Crimson Wolves"
- **When** the user removes it from that mini
- **Then** the faction search no longer offers "Crimson Wolves"

### Requirement: Gone minis

The system SHALL let the user edit a gone mini like any other, saved at
once.

#### Scenario: A sold mini (EDIT-MINI-09)

- **Given** a mini that was sold
- **When** the user adds notes about the buyer
- **Then** the notes are saved, and the mini stays gone

### Requirement: Nothing lost on failure

The system SHALL keep what the user entered when saving fails.

#### Scenario: The server does not save (EDIT-MINI-10)

- **Given** the server can't save
- **When** the user changes the notes of a mini
- **Then** the user is told that it can't be saved right now, and the
  typed notes stay

#### Scenario: Parts are not saved (EDIT-MINI-11)

- **Given** the server can't save
- **When** the user adds a part or a faction to a mini
- **Then** the user is told that it can't be saved right now, and the
  added part or faction stays

## Open questions

- Editing several selected minis at once: the hoard's "Edit" has no
  function yet.
- "Counts as" is in the data model, but the screen has no field for it.
- Whether renaming a built mini to a suggestion should preselect that
  name's parts, as building does.
- The app shows the stored parts and factions again after a failed
  change of them yet (EDIT-MINI-11 is new).
