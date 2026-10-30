# Use case: Let minis leave the hoard

- **ID:** LEAVE
- **Status:** Draft
- **Screens:** [Mini](../screens/mini.md), [Box](../screens/box.md),
  [Hoard](../screens/hoard.md)
- **Domain rules:** [hoard: Leaving the hoard](../domains/hoard.md#leaving-the-hoard),
  [hoard: Workbench](../domains/hoard.md#workbench),
  [hoard: Boxes and kits](../domains/hoard.md#boxes-and-kits)

## Goal

The user records that minis they owned are gone, sold, given away,
stripped for parts, lost or broken, so they no longer count in the hoard
while their record stays; and brings them back if that was a mistake.

## Not in scope

- Removing minis for good, for an entry that was a mistake:
  [DELETE](delete-minis-and-boxes.md).
- Taking only some parts off a mini: that changes its parts,
  [EDIT-MINI](edit-a-mini.md).
- Finding gone minis in the hoard: [BROWSE](find-in-the-hoard.md).

## Requirements

### Requirement: A mini leaves with a reason and a day

The system SHALL keep a mini that leaves the hoard as gone, with the chosen
reason and day, take it off the workbench, and MUST NOT let it leave
without a reason.

#### Scenario: A sold mini (LEAVE-01)

- **Given** a painted Nob on the workbench
- **When** the user lets it leave the hoard as sold on 12 Oct 2026
- **Then** the Nob shows "Sold on 12 Oct 2026", is no longer on the
  workbench, and keeps its status, name, parts and factions

#### Scenario: No reason chosen (LEAVE-02)

- **Given** the user started to let a mini leave the hoard
- **When** no reason is chosen
- **Then** the mini can't leave yet

#### Scenario: Today by default (LEAVE-03)

- **Given** the user starts to let a mini leave the hoard
- **When** the user chooses a reason and does not change the day
- **Then** the mini leaves on today's date

### Requirement: Name the minis that got the parts

The system SHALL let a mini stripped for parts name the minis past the
sprue that got its parts, and show it as a source of parts on each of
them.

#### Scenario: Parts went to another mini (LEAVE-04)

- **Given** a Boy and a Nob, both built
- **When** the user lets the Boy leave as stripped for parts, with the Nob
  as the mini its parts went to
- **Then** the Boy shows that its parts went to the Nob, and the Nob shows
  the Boy as a source of parts

### Requirement: Several minis of a box leave together

The system SHALL let as many alike minis on the sprue of a box leave as the
user counts; the rest stay on the sprue.

#### Scenario: Part of a sprue given away (LEAVE-05)

- **Given** a box with 10 Boyz on the sprue
- **When** the user lets 4 of them leave as given away
- **Then** the box has 6 Boyz on the sprue and 4 gone Boyz

### Requirement: Gone minis no longer count

The system MUST NOT count gone minis in the hoard, the workbench or the
progress of their box.

#### Scenario: Progress without the gone mini (LEAVE-06)

- **Given** a box with one done and one built mini
- **When** the built mini leaves the hoard
- **Then** the box is done at 100%, and the hoard counts one mini less

#### Scenario: Every mini of a box gone (LEAVE-07)

- **Given** a box whose last mini that is not gone leaves the hoard
- **When** the user opens the box or the list of boxes
- **Then** the box shows "All gone" in place of its progress

### Requirement: A gone mini does not leave again

The system MUST NOT let a gone mini leave the hoard again.

#### Scenario: Already gone (LEAVE-08)

- **Given** a sold mini
- **When** the user opens it
- **Then** it offers no way to leave the hoard, only to bring it back

### Requirement: Bring a mini back

The system SHALL remove the departure of a mini brought back into the
hoard; a mini on the sprue comes back on the sprue.

#### Scenario: Back from stripped (LEAVE-09)

- **Given** a Boy stripped for parts that went to a Nob
- **When** the user brings the Boy back into the hoard
- **Then** the Boy counts in the hoard again, and the Nob no longer shows
  it as a source of parts

### Requirement: Nothing changes on failure

The system MUST NOT let a mini leave when saving fails, and SHALL keep what
the user entered.

#### Scenario: The server does not save (LEAVE-10)

- **Given** the server can't save
- **When** the user lets a mini leave the hoard
- **Then** the user is told that it can't be saved right now, and the mini
  is not gone

## Open questions

- Letting selected minis leave from the hoard or a box ("Leave the
  hoard…" in the selection) leads to a leave page that does not exist
  yet; the action has no function.
- Whether the day may lie in the future.
- How departures of minis on the sprue carry over once minis on the sprue
  are stored apart from built minis (domain open question).
