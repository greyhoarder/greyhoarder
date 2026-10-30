# Use case: See progress by faction

- **ID:** OVERVIEW
- **Status:** Draft
- **Screens:** [Dashboard](../screens/dashboard.md), section "In the hoard"
- **Domain rules:** [hoard: Minis](../domains/hoard.md#minis),
  [hoard: Leaving the hoard](../domains/hoard.md#leaving-the-hoard)

## Goal

Right after signing in, the user sees how far their hoard has come per
army: how many minis each faction has and how many of them are painted.

## Not in scope

- The sections "Activity" and "On the workbench" of the dashboard; their
  content is not decided yet.
- Finding single minis or boxes: [Find what is in the hoard](find-in-the-hoard.md).
- Changing a mini's status: [Track progress](track-progress.md).

## Requirements

### Requirement: Count the hoard by faction

The system SHALL show one entry per faction of the user's minis and per
faction they are part of, up the whole chain, with its number of minis, its painted minis and their share, counting painted and
done minis as painted and minis on the sprue as not painted.

#### Scenario: Two factions (OVERVIEW-01)

- **Given** the hoard has 10 minis of the Orks, 3 of them painted and 1
  done, and 5 minis of the Necrons, none painted
- **When** the user opens the dashboard
- **Then** the Orks show 10 minis, 4 painted and 40 %, the Necrons 5
  minis, 0 painted and 0 %, and the summary 15 minis, 4 painted

#### Scenario: A mini of two factions (OVERVIEW-02)

- **Given** the hoard has 1 mini of the Dark Angels and the Space Marines
- **When** the user opens the dashboard
- **Then** both factions count it, and the summary counts 1 mini

#### Scenario: A faction that is part of another (OVERVIEW-09)

- **Given** the hoard has 4 minis of the Space Marines and 2 of the Dark
  Angels, which are part of the Space Marines
- **When** the user opens the dashboard
- **Then** the Space Marines show 6 minis, the Dark Angels 2, and the
  summary 6 minis

#### Scenario: Minis without a faction (OVERVIEW-03)

- **Given** the hoard has minis without a faction
- **When** the user opens the dashboard
- **Then** they are counted under "No faction", shown after every faction

### Requirement: Leave out gone minis

The system MUST NOT count minis that have left the hoard.

#### Scenario: A sold mini (OVERVIEW-04)

- **Given** the hoard has 3 minis of the Orks, 1 of them sold
- **When** the user opens the dashboard
- **Then** the Orks show 2 minis

### Requirement: Largest armies first

The system SHALL sort the factions by their number of minis, most first,
then by name.

#### Scenario: Order of the factions (OVERVIEW-05)

- **Given** the hoard has 5 minis of the Necrons, 10 of the Orks and 5 of
  the Aeldari
- **When** the user opens the dashboard
- **Then** the order is Orks, Aeldari, Necrons

### Requirement: Show each mini's status at a glance

The system SHALL show one mark per mini of a faction in the color of its
status, the furthest status first, and SHALL name the count of each status
for screen readers.

#### Scenario: Marks of a faction (OVERVIEW-06)

- **Given** the Orks have 1 done, 2 painted and 3 minis on the sprue
- **When** the user opens the dashboard
- **Then** the Orks show 6 marks, done first and on the sprue last, read
  as "3 on the sprue, 0 built, 0 primed, 2 painted, 1 done"

### Requirement: Empty and failed hoard

The system SHALL tell the user when the hoard has no minis yet or can't be
loaded, instead of showing factions.

#### Scenario: No minis yet (OVERVIEW-07)

- **Given** the hoard has no minis
- **When** the user opens the dashboard
- **Then** the user is told that there are no minis yet and that adding a
  box makes them appear

#### Scenario: The hoard can't be loaded (OVERVIEW-08)

- **Given** the server does not deliver the hoard
- **When** the user opens the dashboard
- **Then** the user is told that the hoard can't be loaded right now

## Open questions

- Whether a faction leads to the hoard filtered by it.
- Where the user's own factions get their game system from.
