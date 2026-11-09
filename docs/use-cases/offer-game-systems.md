# Use case: Choose the offered game systems

- **ID:** GAME-SYSTEMS
- **Status:** Planned
- **Screens:** [Settings](../screens/settings.md), a new tab "Catalog"
  for administrators
- **Domain rules:** [catalog: Using catalog kits](../domains/catalog.md#using-catalog-kits),
  [catalog: Factions](../domains/catalog.md#factions)

## Goal

An administrator chooses which game systems of the catalog the instance
offers, so the household only finds kits, minis and factions of the games
it plays.

## Not in scope

- Changing the catalog itself; it stays read-only
  ([catalog](../domains/catalog.md)).
- Hiding single factions or kits of an offered game system.
- A choice per user; see "Open questions".

## Requirements

### Requirement: Choose the game systems

The system SHALL let administrators turn each game system of the catalog
on or off for the whole instance, and SHALL apply the choice to every
user at once.

#### Scenario: Turning a game system off (GAME-SYSTEMS-01)

- **Given** the catalog has Warhammer 40,000 and Kill Team, both offered
- **When** an administrator turns Kill Team off
- **Then** the settings show Kill Team as off, and Warhammer 40,000 as on

#### Scenario: Turning it on again (GAME-SYSTEMS-02)

- **Given** Kill Team is off
- **When** an administrator turns it on
- **Then** its kits, minis and factions are offered again

### Requirement: Only offered game systems are offered

The system SHALL leave the kits, minis and factions of a game system that
is off out of every search of the catalog, and out of what is offered
when adding boxes, adding minis and choosing a faction.

#### Scenario: Searching kits (GAME-SYSTEMS-03)

- **Given** Kill Team is off
- **When** a user searches the catalog for a Kill Team kit
- **Then** it is not found

#### Scenario: Choosing a faction (GAME-SYSTEMS-04)

- **Given** Kill Team is off
- **When** a user searches for a faction of Kill Team
- **Then** it is not offered

### Requirement: The hoard stays as it is

The system MUST NOT change or hide boxes and minis of a game system that
is off; they stay in the hoard, in the lists and on the dashboard, and
can be edited as before.

#### Scenario: Minis of a game system that is off (GAME-SYSTEMS-05)

- **Given** ben has a Kill Team box with its minis
- **When** an administrator turns Kill Team off
- **Then** ben still finds the box and its minis and can change their
  status

### Requirement: Only administrators choose

The system MUST refuse changes of the offered game systems from members.

#### Scenario: A member asks the server (GAME-SYSTEMS-06)

- **Given** ben is a member
- **When** a request to turn a game system off reaches the server with
  ben's session
- **Then** it is refused and nothing changes

### Requirement: Nothing changes on failure

The system MUST leave the choice as it was when saving fails, and SHALL
tell the administrator.

#### Scenario: The server does not save (GAME-SYSTEMS-07)

- **Given** the server can't save
- **When** an administrator turns a game system off
- **Then** the administrator is told that it can't be changed right now,
  and the game system stays on

## Open questions

- What an instance offers that was set up before this use case: every
  game system, or none? A new instance offers none until the
  administrator chooses them in the setup
  ([SET-UP-BASICS](set-up-the-basics.md)).
- Whether a game system that a later catalog brings is on or off at
  first.
- Whether at least one game system must stay on.
- Kits listed for factions of several game systems: offered as soon as
  one of them is on?
- Editing a mini of a game system that is off: are its catalog factions
  and parts still offered in the faction and part fields?
- Own factions that are part of a faction of a game system that is off:
  still offered?
- Whether members see which game systems are on, and whether a user may
  later narrow the choice for themselves.
- How the choice looks on the "Catalog" tab: a list of switches, or
  checks in a card.
