# Use case: Edit a box

- **ID:** EDIT-BOX
- **Status:** Draft
- **Screens:** [Box](../screens/box.md)
- **Domain rules:** [hoard: Boxes and kits](../domains/hoard.md#boxes-and-kits)

## Goal

The user corrects what is on the sprue in a box they have: adds the minis
of a sprue that turned up later, or takes out minis that were never in
it, row by row of its kit.

## Not in scope

- Minis that were sold, given away or lost: they leave the hoard,
  [LEAVE](leave-the-hoard.md).
- Built minis: [EDIT-MINI](edit-a-mini.md), [PROGRESS](track-progress.md).
- The box's name, day and tags (open).
- Boxes without a kit (open).

## Requirements

### Requirement: Change the minis on the sprue row by row

The system SHALL let the user raise or lower the number of minis on the
sprue in each row of the box's kit, also in rows that have none. More
SHALL put further minis on the sprue as adding the box would; fewer
SHALL delete minis on the sprue of that row for good. Built and gone
minis MUST NOT change.

#### Scenario: A sprue turned up (EDIT-BOX-01)

- **Given** a box of Boyz with 7 Boys on the sprue
- **When** the user raises the row to 10
- **Then** the box has 10 Boys on the sprue

#### Scenario: Fewer than there were (EDIT-BOX-02)

- **Given** a box of Lootas / Burna Boyz with 2 built Lootas and 3
  undecided minis on the sprue
- **When** the user lowers the row of undecided minis to 1
- **Then** the box has 1 undecided mini on the sprue and still 2 built
  Lootas, and the 2 taken out are not shown as gone

#### Scenario: A row that had none (EDIT-BOX-03)

- **Given** a box of a starter set with only the minis of the Orks on the
  sprue
- **When** the user raises the row of the Space Marines from none to 5
- **Then** the box has 5 Space Marines on the sprue, named as adding the
  starter set would

### Requirement: The box is marked as edited

The system SHALL mark a box as edited once its minis on the sprue were
changed this way.

#### Scenario: A full box changed (EDIT-BOX-04)

- **Given** a box added as its kit describes, not marked as edited
- **When** the user lowers one of its rows
- **Then** the box is marked as edited

### Requirement: Nothing changes on failure

The system MUST NOT change the box when saving fails, and SHALL keep what
the user counted.

#### Scenario: The server does not save (EDIT-BOX-05)

- **Given** the server can't save
- **When** the user changes a row of the box
- **Then** the user is told that it can't be saved right now, the box is
  unchanged, and the counted rows stay

## Open questions

- Whether the box's name, day and tags are edited here as well.
- Whether boxes without a kit can be edited this way.
- Whether deleting minis on the sprue ([DELETE](delete-minis-and-boxes.md))
  marks the box as edited as well.
