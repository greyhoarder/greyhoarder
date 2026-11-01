# Use case: Add accounts

- **ID:** ACCOUNTS
- **Status:** Draft
- **Screens:** [Settings](../screens/settings.md)
- **Domain rules:** [ADR-0007](../adr/0007-local-user-accounts.md)

## Goal

An administrator gives another person of the household an account of
their own, with a first password, so that they keep their own hoard.

## Not in scope

- The first account of an instance: [SET-UP](set-up-the-instance.md).
- Open registration: there is none (ADR-0007).
- Setting a new password for someone, disabling and deleting accounts:
  [MANAGE](manage-accounts.md).
- Changing one's own password: [PASSWORD](change-password.md).

## Requirements

### Requirement: Only administrators manage accounts

The system SHALL show administrators every account with its role, and
MUST NOT offer this to members or answer their requests for it.

#### Scenario: An administrator (ACCOUNTS-01)

- **Given** an instance with the accounts "anna" (administrator) and
  "ben" (member)
- **When** anna opens the users in the settings
- **Then** both accounts are listed with their roles

#### Scenario: A member (ACCOUNTS-02)

- **Given** ben is a member
- **When** ben opens the settings
- **Then** the users are not offered, and opening their address leads to
  the settings instead

#### Scenario: A member asks the server (ACCOUNTS-03)

- **Given** ben is a member
- **When** a request to list or add accounts reaches the server with ben's
  session
- **Then** it is refused and nothing changes

### Requirement: Add an account

The system SHALL create an account with the given username, role and first
password, MUST refuse a username already taken and an empty password, and
MUST NOT create an account then. The strength meter only informs.

#### Scenario: A new member (ACCOUNTS-04)

- **Given** the username "ben" is free
- **When** an administrator adds "ben" as a member with a password
- **Then** the account is listed, and ben can sign in with that password

#### Scenario: A username already taken (ACCOUNTS-05)

- **Given** an account "ben" exists
- **When** an administrator adds another account "ben"
- **Then** the user is told that the username is taken, no account is
  created, and the form stays filled in

#### Scenario: No password (ACCOUNTS-06)

- **Given** the password is empty
- **When** an administrator adds the account
- **Then** the user is told to enter a password, and no account is
  created

#### Scenario: The server does not save (ACCOUNTS-07)

- **Given** the server can't save
- **When** an administrator adds an account
- **Then** the user is told that it can't be added right now, no account
  is created, and the form stays filled in

## Open questions

- Whether usernames are compared ignoring case.
- Whether a first password has to be changed at the first sign-in.
