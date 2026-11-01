# Use case: Manage accounts

- **ID:** MANAGE
- **Status:** Draft
- **Screens:** [Settings](../screens/settings.md)
- **Domain rules:** [ADR-0007](../adr/0007-local-user-accounts.md)

## Goal

An administrator looks after the accounts of the household: sees when an
account was created and last used, changes its role, gives a forgotten
password a new value, disables it or deletes it.

## Not in scope

- Adding accounts: [ACCOUNTS](add-accounts.md).
- A user's own profile and password: [PROFILE](edit-your-profile.md),
  [PASSWORD](change-password.md).
- Changing a username.

## Requirements

### Requirement: Find an account

The system SHALL narrow the list of accounts to those whose username or
display name contains the search, whatever its case.

#### Scenario: Finding an account (MANAGE-12)

- **Given** the accounts mira, ben and "Jonas K."
- **When** an administrator searches for "jo"
- **Then** only Jonas K. is listed

### Requirement: See an account's details

The system SHALL show administrators when an account was created and when
it last signed in, and "Never" for an account that did not sign in since
this is recorded.

#### Scenario: Opening an account (MANAGE-01)

- **Given** an account that signed in yesterday
- **When** an administrator opens it in the users
- **Then** its creation day and its last sign-in are shown

#### Scenario: Signing in is recorded (MANAGE-02)

- **Given** an account
- **When** its user signs in
- **Then** that moment is its last sign-in

### Requirement: Change the role

The system SHALL apply a changed role at once, also to sessions already
running.

#### Scenario: A member becomes an administrator (MANAGE-03)

- **Given** ben is a member and signed in
- **When** an administrator makes ben an administrator
- **Then** ben can manage accounts with his next request

### Requirement: Set a new password

The system SHALL replace the password of the account and end all of its
sessions.

#### Scenario: A forgotten password (MANAGE-04)

- **Given** ben forgot his password and is signed in elsewhere
- **When** an administrator sets a new password
- **Then** ben signs in with the new one only, and the session elsewhere
  has ended

### Requirement: Disable an account

The system SHALL refuse signing in to a disabled account, end its running
sessions, and keep its hoard. Enabling it SHALL restore access.

#### Scenario: Disabling (MANAGE-05)

- **Given** ben is signed in
- **When** an administrator disables ben
- **Then** ben's next request is signed out, and he can't sign in; his
  hoard stays

#### Scenario: Enabling (MANAGE-06)

- **Given** ben is disabled
- **When** an administrator enables ben
- **Then** ben can sign in again and finds his hoard

### Requirement: Delete an account

The system SHALL delete an account only after confirming it, together with
its hoard and picture, its sessions end, and it MUST NOT delete the data of
others.

#### Scenario: Deleting (MANAGE-07)

- **Given** ben has boxes and minis
- **When** an administrator deletes ben and confirms
- **Then** the account, its boxes, minis, parts, own factions and picture
  are gone for good, its sessions have ended, and those of others stay

#### Scenario: Not confirmed (MANAGE-08)

- **Given** an administrator chose to delete ben
- **When** the administrator cancels
- **Then** nothing is deleted

### Requirement: An administrator always remains

The system MUST NOT demote, disable or delete the last active
administrator, and SHALL say why.

#### Scenario: The last administrator (MANAGE-09)

- **Given** mira is the only active administrator
- **When** a change would leave no active administrator
- **Then** it is refused and nothing changes

### Requirement: Only administrators manage accounts

The system MUST refuse these actions from members.

#### Scenario: A member asks the server (MANAGE-10)

- **Given** ben is a member
- **When** a request to change an account reaches the server with ben's
  session
- **Then** it is refused and nothing changes

### Requirement: Nothing changes on failure

The system MUST leave the account as it was when saving fails, and SHALL
tell the administrator.

#### Scenario: The server does not save (MANAGE-11)

- **Given** the server can't save
- **When** an administrator changes an account
- **Then** the administrator is told that it can't be changed right now,
  and the account stays as it was
