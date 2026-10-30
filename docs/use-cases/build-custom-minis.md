# Use case: Build a custom mini from the sprue

- **ID:** BUILD-CUSTOM
- **Status:** Draft
- **Screens:** [Box](../screens/box.md), [Mini](../screens/mini.md)
- **Domain rules:** [hoard: Boxes and kits](../domains/hoard.md#boxes-and-kits),
  [hoard: Factions](../domains/hoard.md#factions),
  [hoard: Parts](../domains/hoard.md#parts)

## Goal

The user builds a mini from the sprue as something no kit suggests, a
kitbash or a conversion, under a name and with parts of their own; the
box still counts the suggestion that mini used up.

## Not in scope

- Building as a name the kit suggests: [BUILD](build-minis.md). How many
  are built, the workbench and failures work as there.
- Minis put together without a sprue in the hoard:
  [ADD-CUSTOM](add-custom-minis.md).
- Changing the mini after building it: [EDIT-MINI](edit-a-mini.md).

## Requirements

### Requirement: Build under an own name

The system SHALL let the user type any name in place of a suggestion and
build the minis under it; typing a name chooses it, and choosing a
suggestion afterwards empties it.

#### Scenario: A kitbash (BUILD-CUSTOM-01)

- **Given** a Boy on the sprue of a box of Boyz
- **When** the user types "Tankbusta Rokkiteer" as their own name and
  builds it
- **Then** the box has a built "Tankbusta Rokkiteer", in a group of its own

#### Scenario: Back to a suggestion (BUILD-CUSTOM-02)

- **Given** the user typed an own name for a mini on the sprue
- **When** the user chooses the suggestion "Boy"
- **Then** the own name is empty, and the mini is built as "Boy"

### Requirement: Use up the suggestion it had on the sprue

The system SHALL count a mini built under an own name against the
suggestion it had on the sprue.

#### Scenario: One Boy fewer (BUILD-CUSTOM-03)

- **Given** a box with 10 Boys left to build
- **When** the user builds one of them as "Tankbusta Rokkiteer"
- **Then** "Boy" has 9 left in this box

### Requirement: Parts of the user's own

The system SHALL let the user give the minis any parts: those the kit
offers, those of the vocabulary, those of the catalog kits of the minis'
factions, and new terms, which become terms of the user's vocabulary when
the minis are built.

#### Scenario: Parts of an earlier kitbash (BUILD-CUSTOM-04)

- **Given** the user built a "Tankbusta Rokkiteer" with a "Rokkit Launcha"
  before
- **When** the user types "Tankbusta Rokkiteer" for another mini on the
  sprue
- **Then** "Rokkit Launcha" is preselected

#### Scenario: A new part (BUILD-CUSTOM-05)

- **Given** "Rokkit pack" is not in the user's vocabulary
- **When** the user creates it as a part and builds the mini
- **Then** the mini carries "Rokkit pack", and it is a term of the user's
  vocabulary

#### Scenario: A part not built (BUILD-CUSTOM-06)

- **Given** the user created "Rokkit pack" for a mini on the sprue
- **When** the user leaves without building
- **Then** "Rokkit pack" is not in the user's vocabulary

### Requirement: Factions of the user's own

The system SHALL let the user change the factions of a mini built on its
own, also to a new own faction, which is created when the mini is built.

#### Scenario: A successor chapter (BUILD-CUSTOM-07)

- **Given** a Space Marine on the sprue, opened on its own
- **When** the user replaces "Space Marines" with a new faction "Crimson
  Wolves" and builds it
- **Then** the mini is built as a Crimson Wolf, and "Crimson Wolves" is one
  of the user's own factions

## Open questions

- Whether the own name offers the names of the user's earlier kitbashes
  as suggestions, as adding custom minis does.
- Whether an own faction created this way can be set as part of another
  faction, e.g. the Space Marines.
