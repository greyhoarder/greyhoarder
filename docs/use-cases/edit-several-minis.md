# Use case: Edit several minis at once

- **ID:** EDIT-MANY
- **Status:** Draft
- **Screens:** [Edit minis](../screens/edit-minis.md), [Hoard](../screens/hoard.md),
  [Box](../screens/box.md)
- **Domain rules:** [hoard: Minis](../domains/hoard.md#minis),
  [hoard: Factions](../domains/hoard.md#factions),
  [hoard: Parts](../domains/hoard.md#parts),
  [hoard: Workbench](../domains/hoard.md#workbench),
  [hoard: Lists of minis](../domains/hoard.md#lists-of-minis)

## Goal

The user changes the status, the workbench place, the factions or the
parts of several selected minis in one go, on a page of its own, instead
of opening each mini; what the user does not touch stays as each mini has
it.

## Not in scope

- One mini, its name, notes and "counts as": [EDIT-MINI](edit-a-mini.md).
- Minis on the sprue: they are built on their box,
  [BUILD](build-minis.md); they can't be selected.
- Letting minis leave the hoard or deleting them:
  [LEAVE](leave-the-hoard.md), [DELETE](delete-minis-and-boxes.md).
- Selecting the minis: [BROWSE](find-in-the-hoard.md).

## Requirements

### Requirement: Open the selected minis

The system SHALL open a page of its own for the minis selected in the
hoard or on a box, gone ones included, and show how many are edited and
what they have now; a value the minis do not share SHALL be shown as
mixed.

#### Scenario: From the hoard (EDIT-MANY-01)

- **Given** the user selected 3 built and 2 primed Boyz in the hoard
- **When** the user chooses "Edit"
- **Then** the page for 5 minis opens, and their status is shown as mixed

#### Scenario: A faction some of them have (EDIT-MANY-02)

- **Given** 2 of 5 selected minis carry the faction "Blood Axes"
- **When** the page opens
- **Then** "Blood Axes" is shown as carried by 2 of the 5 minis

### Requirement: Change only what the user touches

The system SHALL change on every selected mini only what the user changed
on the page, and keep everything else as each mini has it. Factions and
parts SHALL be added to or removed from each mini, never replaced as a
whole.

#### Scenario: Status for all (EDIT-MANY-03)

- **Given** 3 built and 2 primed minis are selected
- **When** the user chooses Painted and applies
- **Then** all 5 minis are painted

#### Scenario: Adding a part keeps the others (EDIT-MANY-04)

- **Given** one selected mini carries a "Slugga", the other a "Choppa"
- **When** the user adds "Stikkbomb" and applies
- **Then** the first carries "Slugga" and "Stikkbomb", the second
  "Choppa" and "Stikkbomb"

#### Scenario: Removing a faction (EDIT-MANY-05)

- **Given** 2 of 5 selected minis carry "Blood Axes"
- **When** the user removes "Blood Axes" and applies
- **Then** none of the 5 minis carries "Blood Axes", and their other
  factions stay

#### Scenario: A part already there (EDIT-MANY-06)

- **Given** one of 2 selected minis carries a glued "Power Klaw"
- **When** the user adds a swappable "Power Klaw" and applies
- **Then** both carry the "Power Klaw" once, swappable

### Requirement: Workbench by the rules

The system SHALL put the selected minis on the workbench or take them off
as the user chooses, and MUST NOT put gone minis or done minis on it.

#### Scenario: Gone and done minis (EDIT-MANY-07)

- **Given** a built, a done and a sold mini are selected
- **When** the user puts them on the workbench and applies
- **Then** only the built mini is on the workbench, and the user was told
  beforehand that 2 of them can't be put there

### Requirement: New factions and parts, and those no mini carries

The system SHALL create new own factions and new terms of the vocabulary
when the changes are applied, and SHALL delete own factions and remove
terms that no mini carries any more afterwards, gone ones included.

#### Scenario: A new part (EDIT-MANY-08)

- **Given** "Rokkit pack" is not in the user's vocabulary
- **When** the user adds it to the selected minis and applies
- **Then** the minis carry it, and it is a term of the user's vocabulary

#### Scenario: The last ones carrying a faction (EDIT-MANY-09)

- **Given** only the selected minis carry the own faction "Blood Axes"
- **When** the user removes it and applies
- **Then** "Blood Axes" is no longer one of the user's factions

### Requirement: Apply all or nothing

The system SHALL save nothing before the user applies the changes, apply
them to every selected mini together, and MUST NOT change any mini when
applying fails.

#### Scenario: Leaving without applying (EDIT-MANY-10)

- **Given** the user changed the status on the page
- **When** the user goes back without applying
- **Then** no mini is changed

#### Scenario: After applying (EDIT-MANY-11)

- **Given** the user changed the minis on the page
- **When** the user applies the changes
- **Then** the user is back where the minis were selected, told how many
  minis were changed, and the selection has ended

#### Scenario: The server does not save (EDIT-MANY-12)

- **Given** the server can't save
- **When** the user applies the changes
- **Then** the user is told that the minis can't be changed right now, no
  mini is changed, and the changes on the page stay

## Open questions

- Whether the page offers "On the sprue" as a status for minis of a box
  (back to the sprue); for now it offers Built, Primed, Painted and Done.
- Whether the status of gone minis may be changed (see
  [PROGRESS](track-progress.md)); for now they are changed like the
  others.
