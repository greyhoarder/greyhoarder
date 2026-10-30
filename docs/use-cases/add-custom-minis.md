# Use case: Add custom minis

- **ID:** ADD-CUSTOM
- **Status:** Draft
- **Screens:** [Add custom](../screens/add-custom.md), [Hoard](../screens/hoard.md)
- **Domain rules:** [hoard: Minis](../domains/hoard.md#minis),
  [hoard: Factions](../domains/hoard.md#factions),
  [hoard: Parts](../domains/hoard.md#parts)

## Goal

The user adds minis they put together themselves, such as kitbashes,
conversions, 3D prints or minis of other manufacturers, with a name,
factions and parts of their own, and says how many there are and how far
they have come.

## Not in scope

- Minis the catalog knows: [Add minis](add-minis.md).
- Minis that come in a box: [Add boxes](add-boxes.md).
- Building a mini of a box under a name of one's own:
  [Build custom minis](build-custom-minis.md).
- Changing minis after adding them: [Edit a mini](edit-a-mini.md).

## Requirements

### Requirement: Add the minis

The system SHALL add as many minis as the user counted, without a box,
with the given name, factions, status, parts and notes, and off the
workbench.

#### Scenario: Several minis (ADD-CUSTOM-01)

- **Given** the user named the minis "Tankbusta Rokkiteer", chose the
  faction Orks, the status Primed and 2 minis
- **When** the user adds them
- **Then** the hoard has 2 more primed "Tankbusta Rokkiteer" minis of the
  Orks without a box, none on the workbench

#### Scenario: Name missing (ADD-CUSTOM-02)

- **Given** the user left the name empty
- **When** the user adds the minis
- **Then** the user is told to give the minis a name, and nothing is added

#### Scenario: No faction (ADD-CUSTOM-03)

- **Given** the user named the minis and chose no faction
- **When** the user adds them
- **Then** the minis are added without a faction

### Requirement: Custom minis are past the sprue

The system SHALL add custom minis as built or further, and MUST NOT offer
the status On the sprue nor accept custom minis on the sprue in any other
way.

#### Scenario: Status offered (ADD-CUSTOM-04)

- **Given** the user opens Add custom
- **When** the user chooses the status
- **Then** Built, Primed, Painted and Done are offered, Built is chosen

### Requirement: Help with names, factions and parts

The system SHALL suggest names from the user's minis and the catalog, offer
the user's own and the catalog factions, and accept new factions and parts
by name.

#### Scenario: A name suggestion (ADD-CUSTOM-05)

- **Given** the hoard has minis named "Nob"
- **When** the user types "nob" as the name and chooses "Nob" from the
  user's minis
- **Then** the name is "Nob", and the factions and parts stay as chosen

#### Scenario: A new faction (ADD-CUSTOM-06)

- **Given** no faction is named "Blood Axes"
- **When** the user creates the faction "Blood Axes" and adds the minis
- **Then** the minis carry "Blood Axes", and it is one of the user's own
  factions

#### Scenario: A new part (ADD-CUSTOM-07)

- **Given** the user gave the minis a part that is not in their vocabulary
- **When** the user adds them
- **Then** the minis carry that part, and it is a term of the user's
  vocabulary

### Requirement: Add alike minis in other states

The system SHALL keep what the user chose after adding, so the same minis
can be added again in another state.

#### Scenario: The same minis again (ADD-CUSTOM-08)

- **Given** the user added 2 built "Tankbusta Rokkiteer" minis
- **When** the user chooses the status Painted and adds 1 more
- **Then** the hoard has 2 built and 1 painted of them more than before

### Requirement: Nothing is added on failure

The system MUST NOT add any mini when adding fails, and SHALL keep what the
user chose.

#### Scenario: The server does not add (ADD-CUSTOM-09)

- **Given** the server can't add minis
- **When** the user adds them
- **Then** the user is told that the minis can't be added right now, no
  mini is added, and everything chosen stays

## Open questions

- Whether added minis can be put on the workbench right away.
- Photos of custom minis.
- The app still accepts custom minis on the sprue when they do not come
  through the screen (a bug).
