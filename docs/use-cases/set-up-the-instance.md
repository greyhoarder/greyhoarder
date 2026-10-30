# Use case: Set up the instance

- **ID:** SET-UP
- **Status:** Draft
- **Screens:** [Setup](../screens/setup.md), [Login](../screens/login.md),
  [Dashboard](../screens/dashboard.md)
- **Domain rules:** [ADR-0007](../adr/0007-local-user-accounts.md)

## Goal

The person who installed Greyhoarder creates the first account of the
instance, becomes its administrator and starts using their hoard.

## Not in scope

- Signing in and out once the instance is set up:
  [Sign in and out](sign-in-and-out.md).
- Creating further accounts; they are created by an administrator (later).

## Requirements

### Requirement: Create the first administrator

The system SHALL create the first account with the given username and
password as an administrator, sign it in and take it to its dashboard.

#### Scenario: Valid username and password (SET-UP-01)

- **Given** no account exists yet
- **When** the user sets up the instance with the username "anna" and a
  password repeated the same
- **Then** anna is signed in as an administrator and the dashboard of her
  hoard is shown

#### Scenario: Passwords differ (SET-UP-02)

- **Given** no account exists yet
- **When** the user sets up the instance with a password and a different
  repetition
- **Then** the user is told that the passwords differ, and no account is
  created

#### Scenario: Username not allowed (SET-UP-03)

- **Given** no account exists yet
- **When** the user sets up the instance with a username that breaks the
  [username rules](../screens/setup.md#behavior), e.g. "an"
- **Then** the user is told what is wrong with the username, and no
  account is created

### Requirement: Rate the password without blocking

The system SHALL show how hard the typed password is to guess, and MUST NOT
refuse a password for being weak.

#### Scenario: A weak password (SET-UP-04)

- **Given** no account exists yet
- **When** the user types the password "anna1"
- **Then** the password is rated "Too weak", and the instance can still be
  set up with it

### Requirement: Set up only once

The system MUST offer the setup only while no account exists, and SHALL
lead to it while none does.

#### Scenario: Already set up (SET-UP-05)

- **Given** an account exists
- **When** the user opens the setup
- **Then** the login is shown instead

#### Scenario: Someone else was faster (SET-UP-06)

- **Given** the setup is open in two browsers
- **When** the first finishes it and then the second sends the form
- **Then** the second is taken to the login with a notice that the
  instance is already set up, and no second account is created

#### Scenario: Not set up yet (SET-UP-07)

- **Given** no account exists yet
- **When** the user opens any page, e.g. the hoard
- **Then** the setup is shown

### Requirement: Nothing is created on failure

The system MUST NOT create an account when the server can't be reached, and
SHALL keep what the user entered.

#### Scenario: The server does not answer (SET-UP-08)

- **Given** the server can't be reached
- **When** the user sets up the instance
- **Then** the user is told that the server can't be reached right now,
  and the entered username stays

## Open questions

- What the user sees when the account was created but signing in right
  afterwards fails; today the login is shown without a message.
- Whether the administrator stays signed in on the device after the setup;
  today they are signed in without "Keep me signed in on this device".
