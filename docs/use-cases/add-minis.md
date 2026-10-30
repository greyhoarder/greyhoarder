# Use case: Add minis from the catalog

- **ID:** ADD-MINIS
- **Status:** Draft
- **Screens:** [Add minis](../screens/add-minis.md), [Hoard](../screens/hoard.md)
- **Domain rules:** [hoard: Minis](../domains/hoard.md#minis),
  [hoard: Parts](../domains/hoard.md#parts),
  [catalog: Using catalog kits](../domains/catalog.md#using-catalog-kits)

## Goal

The user adds minis they own without their box, bought loose, second hand
or already painted, by finding them in the catalog and saying how many
there are and how far they have come.

## Not in scope

- Minis the catalog does not know: [Add custom](../screens/add-custom.md).
- Minis that come in a box: [Add box](../screens/add-box.md).
- Adding a mini to a box the user already has (later).
- Changing minis after adding them: [Mini](../screens/mini.md).

## Requirements

### Requirement: Find a mini in the catalog

The system SHALL offer the minis the catalog kits can be built as, found by
their name, the name of a kit they come in or their faction.

#### Scenario: Search by name and faction (ADD-MINIS-01)

- **Given** a catalog kit "Boyz" whose models can be built as "Nob" for
  the Orks
- **When** the user searches for "Ork Nob"
- **Then** "Nob" of the Orks from "Boyz" is offered to be added

#### Scenario: Nothing matches (ADD-MINIS-02)

- **Given** no catalog mini matches the search
- **When** the user searches for it
- **Then** the user is told that no minis match, and nothing is offered

### Requirement: Add the minis

The system SHALL add as many minis as the user counted, without a box, with
the name and faction from the catalog, the kit they were found in, the
chosen status and parts, and off the workbench.

#### Scenario: Several built minis (ADD-MINIS-03)

- **Given** the user chose "Nob" of the Orks from "Boyz", the status
  Built and 3 minis
- **When** the user adds them
- **Then** the hoard has 3 more built Nobs of the Orks without a box, each
  recording "Boyz" as its kit and none on the workbench

#### Scenario: Minis on the sprue (ADD-MINIS-04)

- **Given** the user chose a mini with the status On the sprue
- **When** the user adds it
- **Then** it is listed among the minis of the hoard, although it is on the
  sprue

#### Scenario: A new part (ADD-MINIS-05)

- **Given** the user gave the minis a part that is not in their vocabulary
- **When** the user adds them
- **Then** the minis carry that part, and it is a term of the user's
  vocabulary

### Requirement: Add alike minis in other states

The system SHALL keep the chosen mini after adding, so the same mini can be
added again in another state.

#### Scenario: The same mini again (ADD-MINIS-06)

- **Given** the user added 2 built Nobs
- **When** the user chooses the status Painted and adds 1 more
- **Then** the hoard has 2 built and 1 painted Nob more than before

### Requirement: Nothing is added on failure

The system MUST NOT add any mini when adding fails, and SHALL keep what the
user chose.

#### Scenario: The server does not add (ADD-MINIS-07)

- **Given** the server can't add minis
- **When** the user adds them
- **Then** the user is told that the minis can't be added right now, no
  mini is added, and the chosen mini, status, parts and count stay

## Open questions

- Whether added minis can be put on the workbench right away.
