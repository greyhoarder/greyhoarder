# Use case: Find what is in the hoard

- **ID:** BROWSE
- **Status:** Draft
- **Screens:** [Hoard](../screens/hoard.md), [Mini](../screens/mini.md),
  [Box](../screens/box.md)
- **Domain rules:** [hoard: Lists of minis](../domains/hoard.md#lists-of-minis),
  [hoard: Boxes and kits](../domains/hoard.md#boxes-and-kits),
  [hoard: Leaving the hoard](../domains/hoard.md#leaving-the-hoard)

## Goal

The user looks through what they own, the minis and the boxes they came
in, and finds a mini or a box by searching and filtering, to see how far
it has come or to open it.

## Not in scope

- What the user does with selected minis: leaving the hoard is
  [LEAVE](leave-the-hoard.md), deleting is
  [DELETE](delete-minis-and-boxes.md); editing several at once comes later.
- Progress per faction on the dashboard: [OVERVIEW](progress-by-faction.md).
- Building the minis on the sprue of a box: [BUILD](build-minis.md),
  [BUILD-CUSTOM](build-custom-minis.md).

## Requirements

### Requirement: List the minis in groups

The system SHALL list the minis past the sprue, with minis of the same
name, factions and parts in one group whatever their box, and MUST NOT list
the minis on the sprue of a box among them.

#### Scenario: Alike minis from two boxes (BROWSE-01)

- **Given** two boxes of "Boyz" with 3 built Boyz with a Slugga each
- **When** the user opens the minis of the hoard
- **Then** one group "Boy" with the Slugga and 6 minis is listed, and
  opened it lists each mini with its box

#### Scenario: Minis on the sprue (BROWSE-02)

- **Given** a box with 10 minis on the sprue and a mini on the sprue
  without a box
- **When** the user opens the minis of the hoard
- **Then** the minis of the box are not listed, and the mini without a box
  is

### Requirement: Search and filter

The system SHALL show only the minis whose name, a part or box contains
the search text, ignoring case, and that match every filter; the values
ticked in one filter are alternatives.

#### Scenario: Search by part (BROWSE-03)

- **Given** minis carrying the part "Power Klaw"
- **When** the user searches for "klaw"
- **Then** only those minis are shown, and the count of minis says how
  many are shown of all

#### Scenario: Two filters (BROWSE-04)

- **Given** the Orks and the Space Marines each have built and painted
  minis
- **When** the user ticks Orks in the faction filter and Built and
  Painted in the status filter
- **Then** only the built and the painted minis of the Orks are shown

#### Scenario: A faction and those part of it (BROWSE-13)

- **Given** the hoard has built minis of the Space Marines, of the Dark
  Angels, which are part of the Space Marines, and of the Orks
- **When** the user ticks Space Marines in the faction filter
- **Then** the minis of the Space Marines and of the Dark Angels are
  shown, but not those of the Orks

#### Scenario: Reset (BROWSE-05)

- **Given** a search text and a ticked filter
- **When** the user resets the filters
- **Then** no filter is ticked and the search text stays

#### Scenario: Nothing matches (BROWSE-06)

- **Given** no mini matches the search and the filters
- **When** the list is shown
- **Then** the user is told that no minis match, and nothing is listed

### Requirement: Gone minis only on request

The system MUST NOT show or count gone minis unless the user ticks "Gone"
in the status filter.

#### Scenario: Showing gone minis (BROWSE-07)

- **Given** a sold Nob
- **When** the user ticks "Gone" in the status filter
- **Then** the Nob is shown with "Sold" in place of its status

### Requirement: Sort the table

The system SHALL list every mini on its own line in the table, sorted by
faction at first, and sort it by any column the user chooses.

#### Scenario: Sorting by status (BROWSE-08)

- **Given** the table of minis
- **When** the user sorts by status, and then sorts by status again
- **Then** the minis are sorted by status ascending, then descending

### Requirement: List the boxes

The system SHALL list the boxes, newest first, each with its kit, progress
and tags, found by name, kit, article number or tag and filtered by
faction, progress and tag.

#### Scenario: Box by tag (BROWSE-09)

- **Given** a box tagged "Second hand" and others without the tag
- **When** the user searches the boxes for "second"
- **Then** only that box is shown, with its progress

### Requirement: Open a mini or a box and come back

The system SHALL open a mini or a box from the hoard, and keep search,
filters, view and open groups when the user comes back.

#### Scenario: Back from a mini (BROWSE-10)

- **Given** the user searched for "nob" and opened a group
- **When** the user opens a mini of it and goes back
- **Then** the hoard shows the same search, filters, view and open group

#### Scenario: Opening a box (BROWSE-11)

- **Given** the list of boxes
- **When** the user opens a box
- **Then** the box is shown with its progress and its minis, and going back
  returns to the boxes

### Requirement: Tell when the hoard can't be loaded

The system SHALL tell the user when the hoard can't be loaded.

#### Scenario: The server does not answer (BROWSE-12)

- **Given** the server can't deliver the hoard
- **When** the user opens the hoard
- **Then** the user is told that the hoard can't be loaded right now, and
  no list is shown

## Open questions

- The hoard screen says minis on the sprue are left out of the minis of
  the hoard; the domain and the app list those without a box (BROWSE-02).
  The status filter offers no "On the sprue" for them.
- The app's faction filter matches the chosen faction only yet
  (BROWSE-13 is new).
- The search also matches the kit of a mini without a box; the hoard screen
  names only name, part and box.
- Boxes can be selected, but the selection has no actions yet.
