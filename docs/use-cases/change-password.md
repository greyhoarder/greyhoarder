# Use case: Change one's own password

- **ID:** PASSWORD
- **Status:** Draft
- **Screens:** [Profile](../screens/profile.md)
- **Domain rules:** [ADR-0007](../adr/0007-local-user-accounts.md)

## Goal

A signed-in user replaces their password, for example the first password
an administrator gave them.

## Not in scope

- A forgotten password: an administrator sets a new one, later; there is
  no reset by email (ADR-0007).
- Passwords of other accounts.

## Requirements

### Requirement: Change the password with the current one

The system SHALL replace the password only when the current password is
right and the new one is not empty and repeated correctly, and MUST keep
the old password otherwise. The strength meter only informs.

#### Scenario: A new password (PASSWORD-01)

- **Given** a signed-in user who knows their password
- **When** the user gives it, and a new password twice
- **Then** the user is told that the password was changed, stays signed
  in, and can sign in with the new password only

#### Scenario: A wrong current password (PASSWORD-02)

- **Given** a signed-in user
- **When** the user gives a wrong current password
- **Then** the user is told that the current password is wrong, and the
  password stays

#### Scenario: Too many attempts (PASSWORD-03)

- **Given** the current password was wrong too often in a short time
- **When** the user tries again
- **Then** the user is told that changing the password is paused for a
  moment, and the password stays

#### Scenario: No new password (PASSWORD-04)

- **Given** the new password is empty
- **When** the user changes the password
- **Then** the user is told to enter one, and the password stays

#### Scenario: Repeated differently (PASSWORD-05)

- **Given** the two new passwords differ
- **When** the user changes the password
- **Then** the user is told that they differ, and the password stays

#### Scenario: The server does not save (PASSWORD-06)

- **Given** the server can't save
- **When** the user changes the password
- **Then** the user is told that it can't be changed right now, and the
  password stays

### Requirement: Other sessions end

The system SHALL end the user's other sessions when the password changes,
and when the user asks for it.

#### Scenario: Signed in elsewhere (PASSWORD-07)

- **Given** the user is signed in on two devices
- **When** the user changes the password on one of them
- **Then** the other device is signed out

#### Scenario: Signing out other devices (PASSWORD-08)

- **Given** the user is signed in on two devices
- **When** the user signs out the other devices on one of them
- **Then** the other device is signed out, and this one stays signed in
