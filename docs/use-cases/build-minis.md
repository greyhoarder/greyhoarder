# Use case: Build minis as the catalog suggests

- **ID:** BUILD
- **Status:** Draft
- **Screens:** [Box](../screens/box.md), [Mini](../screens/mini.md)
- **Domain rules:** [hoard: Boxes and kits](../domains/hoard.md#boxes-and-kits),
  [hoard: Parts](../domains/hoard.md#parts),
  [hoard: Workbench](../domains/hoard.md#workbench),
  [hoard: Lists of minis](../domains/hoard.md#lists-of-minis)

## Goal

The user takes minis whose form a kit defines off the sprue, those of a box
or those added loose from the catalog, and builds them as one of the names
the kit suggests, with the parts they actually glued on: several alike
minis at once on their box, or one mini on its own.

## Not in scope

- Building under a name of one's own: [BUILD-CUSTOM](build-custom-minis.md).
- Getting minis onto the sprue: [ADD-BOXES](add-boxes.md),
  [ADD-MINIS](add-minis.md).
- Priming, painting and the workbench after building:
  [PROGRESS](track-progress.md).
- Changing a built mini: [EDIT-MINI](edit-a-mini.md).
- Letting minis on the sprue leave or deleting them:
  [LEAVE](leave-the-hoard.md), [DELETE](delete-minis-and-boxes.md).

## Requirements

### Requirement: Offer what the kit suggests

The system SHALL offer as names to build what the slots the mini was put on
the sprue from can be built as; for a mini without a box, the names of its
catalog kit's slots that offer its name.

#### Scenario: Undecided minis of an either-or kit (BUILD-01)

- **Given** a box of "Lootas / Burna Boyz" with its undecided minis on the
  sprue
- **When** the user starts building one of them
- **Then** "Loota" and "Burna Boy" are offered, and "Spanner" is not

#### Scenario: A loose mini from the catalog (BUILD-02)

- **Given** a "Nob" added on the sprue from the catalog kit "Boyz", without
  a box
- **When** the user opens it
- **Then** the names of the kit's slots that offer "Nob" are offered,
  without saying how many are left

### Requirement: Count what is left in the box

The system SHALL show for each offered name how many minis the box's kit
provides for it that this box has not used up yet, and MUST NOT block
building more than that.

#### Scenario: Either-or names use each other up (BUILD-03)

- **Given** a box whose kit provides 5 Lootas or Burna Boyz, 2 of them
  built as "Loota"
- **When** the user starts building another of its minis
- **Then** both "Loota" and "Burna Boy" have 3 left in this box

#### Scenario: More than the box provides (BUILD-04)

- **Given** no "Boss Nob" is left in the box
- **When** the user builds a mini as "Boss Nob"
- **Then** the user is told that none is left, and the mini is built as
  "Boss Nob" all the same

### Requirement: Preselect the parts

The system SHALL preselect the parts of the mini most recently built as the
chosen name, or else the part the kit offers for that name when it offers
exactly one, and SHALL keep parts the user changed when another name is
chosen.

#### Scenario: Like the last one (BUILD-05)

- **Given** the user built a "Boss Nob" with a "Power Klaw" before
- **When** the user chooses "Boss Nob" for a mini on the sprue
- **Then** "Power Klaw" is preselected

#### Scenario: The kit's only part (BUILD-06)

- **Given** no mini was built as "Loota" yet, and the kit offers only a
  "Deffgun" for it
- **When** the user chooses "Loota"
- **Then** "Deffgun" is preselected

### Requirement: Build as many as chosen

The system SHALL build as many alike minis of a row on the box as the user
counted, or the one mini opened on its own, with the chosen name, parts and
notes, and on the mini on its own also the chosen factions; minis built
on the box keep the factions their kit gave them, and anything further is
decided per mini. It MUST NOT save anything before the user builds.

#### Scenario: Several of a row (BUILD-07)

- **Given** a box with a row of 10 Boys on the sprue
- **When** the user builds 4 of them as "Boy"
- **Then** 4 built Boys appear among the box's minis, and 6 Boys stay on
  the sprue

#### Scenario: One mini on its own (BUILD-08)

- **Given** a Boy on the sprue opened on its own, with 9 alike Boys in its
  box
- **When** the user builds it
- **Then** only that mini is built, and the 9 Boys stay on the sprue

#### Scenario: Leaving without building (BUILD-09)

- **Given** the user chose a name and parts for a mini on the sprue
- **When** the user leaves the screen without building
- **Then** the mini is still on the sprue, unchanged

### Requirement: Put built minis on the workbench

The system SHALL put the built minis on the workbench, unless the user
unticks it before building.

#### Scenario: On the workbench at first (BUILD-10)

- **Given** the user did not untick "Put on workbench"
- **When** the user builds 2 minis
- **Then** both are built and on the workbench

### Requirement: Nothing is built on failure

The system MUST NOT build any mini when building fails, and SHALL keep what
the user chose.

#### Scenario: The server does not build (BUILD-11)

- **Given** the server can't save
- **When** the user builds 3 minis
- **Then** the user is told that it can't be saved right now, all 3 are
  still on the sprue, and the chosen name, parts and count stay

## Open questions

- The [hoard](../screens/hoard.md) leaves every mini on the sprue out of
  the Minis tab, while the domain and the app list those without a box
  there; which way a loose mini on the sprue is reached.
- The box screen does not describe what the user sees when building fails.
