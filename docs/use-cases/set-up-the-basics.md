# Use case: Choose the basic settings while setting up

- **ID:** SET-UP-BASICS
- **Status:** Planned
- **Screens:** [Setup](../screens/setup.md),
  [Settings](../screens/settings.md)
- **Domain rules:** [ADR-0007](../adr/0007-local-user-accounts.md),
  [catalog](../domains/catalog.md)
- **Related:** [Set up the instance](set-up-the-instance.md),
  [Choose the offered game systems](offer-game-systems.md)

## Goal

The person setting up the instance not only creates the first
administrator, but also chooses the basic settings of the instance right
away, its language and the offered game systems, so the household finds a
ready instance on its first sign-in.

## Not in scope

- Creating the first administrator, and that the setup runs only once:
  [SET-UP](set-up-the-instance.md).
- Changing the settings after the setup; they are changed in the
  settings, e.g. [GAME-SYSTEMS](offer-game-systems.md).
- Settings a user makes for themselves, such as the appearance
  ([APPEARANCE](choose-appearance.md)).

## Requirements

### Requirement: Set up in steps

The system SHALL lead through the setup in steps, shown as numbered
segments like those of adding a box: 1. Language, 2. Administrator,
3. Game systems. A step SHALL be left only when its input is valid.

#### Scenario: Going through the steps (SET-UP-BASICS-01)

- **Given** no account exists yet
- **When** the user chooses a language and continues
- **Then** the step "Administrator" is shown in that language, and the
  segment of "Language" is marked as done

#### Scenario: An invalid step (SET-UP-BASICS-02)

- **Given** the step "Administrator" is open
- **When** the user continues with passwords that differ
- **Then** the step stays open with the message, and "Game systems" is
  not shown

### Requirement: Choose the language while setting up

The system SHALL offer the languages of the app in the first step, with
the browser's language chosen at first, and SHALL use the chosen one for
the rest of the setup and as the language of the instance.

#### Scenario: Choosing German (SET-UP-BASICS-03)

- **Given** no account exists yet, and the browser's language is English
- **When** the user chooses Deutsch in the first step
- **Then** the following steps are in German, and the new administrator's
  language is Deutsch

### Requirement: Choose the game systems while setting up

The system SHALL offer the game systems of the catalog during the setup
and SHALL offer exactly the chosen ones once the instance is set up.

#### Scenario: Only one game system chosen (SET-UP-BASICS-04)

- **Given** no account exists yet, and the catalog has Warhammer 40,000
  and Kill Team
- **When** the user sets up the instance and chooses only Warhammer 40,000
- **Then** the instance offers only Warhammer 40,000, and the "Catalog"
  tab of the settings shows Kill Team as off

### Requirement: No game system is chosen at first

The system SHALL show every game system of the catalog as not chosen in
the step "Game systems".

#### Scenario: Opening the step (SET-UP-BASICS-05)

- **Given** the catalog has Warhammer 40,000 and Kill Team
- **When** the user reaches the step "Game systems"
- **Then** neither is chosen

### Requirement: Changeable later

The system SHALL let administrators change every basic setting chosen in
the setup later in the settings.

#### Scenario: Changing it afterwards (SET-UP-BASICS-06)

- **Given** the instance was set up with only Warhammer 40,000
- **When** an administrator turns Kill Team on in the settings
- **Then** Kill Team is offered as well

### Requirement: Only during the setup

The system MUST accept basic settings without an administrator's session
only as part of the setup, while no account exists.

#### Scenario: After the setup (SET-UP-BASICS-07)

- **Given** an account exists
- **When** a request with basic settings of the setup reaches the server
  without a session
- **Then** it is refused and nothing changes

### Requirement: All or nothing

The system MUST NOT leave an instance with an administrator but without
the chosen basics, or with basics but without an administrator, when
the setup fails.

#### Scenario: The server does not answer (SET-UP-BASICS-08)

- **Given** the server can't be reached
- **When** the user finishes the setup
- **Then** the user is told that the server can't be reached right now,
  and what they entered and chose stays

## Open questions

- Whether the setup can be finished with no game system chosen, leaving
  an instance that offers only custom minis.
- What "the language of the instance" means besides the administrator's
  own: the language of new accounts, of the login before signing in
  (today the browser's, [ADR-0028](../adr/0028-translations-with-transloco.md)),
  or both; and where an administrator changes it later.
- Whether steps can go back, and whether the order Language,
  Administrator, Game systems is right.
- Whether a step "Done" follows, as when adding a box, or the setup ends
  on the dashboard as today.
- Whether the basics are saved together with the account in one request,
  or by the new administrator right after; the second would make
  SET-UP-BASICS-07 and -08 simpler, but can leave an instance without the
  chosen basics.
- Whether this use case becomes part of [SET-UP](set-up-the-instance.md)
  once it is started, instead of staying a use case of its own.
