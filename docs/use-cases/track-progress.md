# Use case: Track hobby progress

- **ID:** PROGRESS
- **Status:** Draft
- **Screens:** [Box](../screens/box.md), [Mini](../screens/mini.md),
  [Hoard](../screens/hoard.md)
- **Domain rules:** [hoard: Minis](../domains/hoard.md#minis),
  [hoard: Boxes and kits](../domains/hoard.md#boxes-and-kits),
  [hoard: Workbench](../domains/hoard.md#workbench)

## Goal

The user records how far each built mini has come, primed, painted or done,
and which minis they are working on, and sees the progress of its box
follow.

## Not in scope

- Taking minis off the sprue: [BUILD](build-minis.md),
  [BUILD-CUSTOM](build-custom-minis.md).
- Name, parts, factions and notes: [EDIT-MINI](edit-a-mini.md).
- Progress per faction: [OVERVIEW](progress-by-faction.md).
- Minis leaving the hoard, which also takes them off the workbench:
  [LEAVE](leave-the-hoard.md).

## Requirements

### Requirement: Change the status of a built mini

The system SHALL let the user set a built mini of a box to built, primed,
painted or done, also backwards, and save it at once for that one mini.

#### Scenario: Primed (PROGRESS-01)

- **Given** a group of 5 built Boys in a box
- **When** the user sets one of them to primed
- **Then** that mini is primed, it stays in its group, and the group shows
  4 built and 1 primed

#### Scenario: Backwards (PROGRESS-02)

- **Given** a painted mini that was stripped of its paint
- **When** the user sets it to built
- **Then** the mini is built

### Requirement: The box's progress follows

The system SHALL derive a box's progress from its minis that are not gone:
untouched while all are on the sprue, done once all are painted or done,
started in between, and a percentage weighted by status.

#### Scenario: The last mini painted (PROGRESS-03)

- **Given** a box with one painted and one built mini, shown as started at
  50%
- **When** the user sets the built mini to painted
- **Then** the box shows done at 75%

### Requirement: Put minis on the workbench

The system SHALL put a built mini on the workbench or take it off only when
the user says so, saved at once; a change of status alone MUST NOT put it
there.

#### Scenario: On the workbench (PROGRESS-04)

- **Given** a built mini that is not on the workbench
- **When** the user puts it on the workbench
- **Then** it is on the workbench, also on its box

#### Scenario: Status alone (PROGRESS-05)

- **Given** a built mini that is not on the workbench
- **When** the user sets it to primed
- **Then** it is primed and still not on the workbench

### Requirement: Done leaves the workbench

The system SHALL take a mini off the workbench when it is set to done.

#### Scenario: Done (PROGRESS-06)

- **Given** a painted mini on the workbench
- **When** the user sets it to done
- **Then** it is done and no longer on the workbench

### Requirement: The stored status on failure

The system SHALL show the stored status again when saving a status fails.

#### Scenario: The server does not save (PROGRESS-07)

- **Given** the server can't save
- **When** the user sets a built mini to primed
- **Then** the user is told that it can't be saved right now, and the mini
  shows built again

## Open questions

- The mini screen only shows the status; whether it gets a control to
  change it.
- The domain allows any status, also back to the sprue; the box offers
  only built to done.
- The domain puts minis on the workbench several at once; today only
  building does, and the hoard's "Edit" for selected minis has no function
  yet.
- Whether the status of a gone mini can be changed; neither screen offers
  it.
- Where the workbench is shown: the dashboard's "On the workbench" is not
  built yet.
