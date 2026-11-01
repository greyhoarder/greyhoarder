# Use case: Edit your profile

- **ID:** PROFILE
- **Status:** Draft
- **Screens:** [Profile](../screens/profile.md), [Shell](../screens/shell.md)
- **Domain rules:** [ADR-0007](../adr/0007-local-user-accounts.md)

## Goal

A signed-in user sets how they appear and which language they prefer: a
display name, a picture and a language. Their username stays as it is.

## Not in scope

- Changing the username or the role.
- Translating the app: the language is only stored for now; translations
  come later with their own decision.
- Pictures of other accounts, of minis and of boxes.

## Requirements

### Requirement: A display name

The system SHALL show a user's display name instead of their username in
the shell and the greeting, SHALL show the username while there is no
display name, and MUST NOT change the username used to sign in.

#### Scenario: A new display name (PROFILE-01)

- **Given** a user "mira" without a display name
- **When** the user enters "Mira K." on the profile
- **Then** the shell and the dashboard show "Mira K.", and the user still
  signs in as "mira"

#### Scenario: Removing the display name (PROFILE-02)

- **Given** a user with a display name
- **When** the user empties the field
- **Then** the username is shown again

#### Scenario: Too long (PROFILE-03)

- **Given** a text of more than 50 characters
- **When** the user enters it
- **Then** the user is told that it is too long, and the display name
  stays as it was

### Requirement: A language

The system SHALL store the language the user chooses with their account.
The app MUST stay in English for now.

#### Scenario: Choosing a language (PROFILE-04)

- **Given** a user with the language English
- **When** the user chooses "Deutsch" and signs in on another device
- **Then** the profile shows "Deutsch" there, and the app stays in English

### Requirement: A picture

The system SHALL show the user's picture in place of the first letter of
their name, on the profile and in the shell, MUST accept only images of a
limited size and type, and MUST serve a picture only to signed-in users.

#### Scenario: A new picture (PROFILE-05)

- **Given** a user without a picture
- **When** the user chooses a photo
- **Then** it is made square and small, and the profile and the shell show
  it

#### Scenario: Removing the picture (PROFILE-06)

- **Given** a user with a picture
- **When** the user removes it
- **Then** the file is deleted and the first letter is shown again

#### Scenario: Not an image (PROFILE-07)

- **Given** a file that is no image
- **When** the user chooses it
- **Then** the user is told to choose an image, and the picture stays

#### Scenario: Refused by the server (PROFILE-08)

- **Given** a request with a file over the limit or of another type
- **When** it reaches the server
- **Then** it is refused and nothing is stored

### Requirement: Nothing changes on failure

The system MUST keep the profile as it was when saving fails, and SHALL
tell the user.

#### Scenario: The server does not save (PROFILE-09)

- **Given** the server can't save
- **When** the user changes the display name, the language or the picture
- **Then** the user is told that it can't be saved right now, and the
  stored value is shown again
