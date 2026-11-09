# Use case: Give minis a loadout

- **ID:** LOADOUTS
- **Status:** Planned
- **Screens:** [Mini](../screens/mini.md),
  [Edit minis](../screens/edit-minis.md), where loadouts are managed is
  open
- **Domain rules:** [hoard: Parts](../domains/hoard.md#parts)
- **Related:** [Edit a mini](edit-a-mini.md),
  [Edit several minis at once](edit-several-minis.md),
  [Build minis](build-minis.md)

## Goal

The user saves a set of parts they use again and again under a name, a
loadout such as "Flamer squad" (Flamer, Chainsword), and gives it to minis
in one go instead of choosing the same parts one by one.

## Not in scope

- Switching a magnetised mini between several sets of parts; a mini has
  one set of parts, some of them swappable, as today.
- Loadouts from the catalog; see "Open questions".
- Checking a loadout against rules or kits: like parts, loadouts describe
  plastic, not rules ([hoard: Parts](../domains/hoard.md#parts)).

## Requirements

### Requirement: Save a loadout

The system SHALL let a user save a loadout with a name and one or more
parts of their vocabulary; a new part can be typed as when choosing parts
for a mini. Each user has their own loadouts.

#### Scenario: Saving a loadout (LOADOUTS-01)

- **Given** mira has no loadouts
- **When** she saves "Flamer squad" with Flamer and Chainsword
- **Then** "Flamer squad" is offered to her with these two parts, and not
  to ben

#### Scenario: A name twice (LOADOUTS-02)

- **Given** mira has the loadout "Flamer squad"
- **When** she saves another one named "flamer squad"
- **Then** she is told the name is taken, and nothing is saved

### Requirement: Give a loadout to minis

The system SHALL offer the user's loadouts wherever parts are chosen for
one or several minis, and SHALL give the minis the parts of the chosen
loadout.

#### Scenario: One mini (LOADOUTS-03)

- **Given** a Space Marine without parts and the loadout "Flamer squad"
- **When** the user gives it "Flamer squad"
- **Then** the mini has Flamer and Chainsword

#### Scenario: Several minis (LOADOUTS-04)

- **Given** five Space Marines selected
- **When** the user gives them "Flamer squad"
- **Then** all five have Flamer and Chainsword

### Requirement: Change and delete loadouts

The system SHALL let a user rename a loadout, change its parts and delete
it. Deleting a loadout MUST NOT change the parts of minis.

#### Scenario: Deleting a loadout (LOADOUTS-05)

- **Given** minis that got their parts from "Flamer squad"
- **When** the user deletes "Flamer squad"
- **Then** it is no longer offered, and the minis keep Flamer and
  Chainsword

## Open questions

- Copy or reference: does a mini only get the parts, or does it remember
  its loadout, so a changed loadout changes its minis and the hoard can be
  filtered by loadout?
- Does giving a loadout add its parts to those a mini has, or replace
  them?
- Can a loadout mark parts as swappable, and does a mini take that over?
- Is a loadout tied to factions, so only fitting loadouts are offered
  (e.g. only to Space Marines)?
- Where loadouts are managed: on the profile, in the settings, or only
  created from the parts of a mini ("Save as loadout")?
- Is it offered while building minis from the sprue as well
  ([BUILD](build-minis.md))?
- Does a part leave the vocabulary while a loadout still holds it (today
  a term no mini carries leaves the vocabulary)?
- Could the catalog later suggest loadouts per kit?
