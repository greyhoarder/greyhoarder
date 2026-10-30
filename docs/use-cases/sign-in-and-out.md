# Use case: Sign in and out

- **ID:** SIGN-IN
- **Status:** Draft
- **Screens:** [Login](../screens/login.md), [Shell](../screens/shell.md),
  [Setup](../screens/setup.md), [Dashboard](../screens/dashboard.md)
- **Domain rules:** [ADR-0007](../adr/0007-local-user-accounts.md),
  [ADR-0009](../adr/0009-sessions-with-redis.md)

## Goal

A member or administrator gets into their own hoard with their username and
password, and leaves it again, so nobody else using the same device sees
it.

## Not in scope

- Setting up the instance and its first account: [Setup](../screens/setup.md).
- Creating accounts, resetting passwords and disabling accounts; they are
  done by an administrator (later).
- Changing one's own password (later).

## Requirements

### Requirement: Sign in with username and password

The system SHALL sign a user in with the username and password of their
account and take them to their dashboard.

#### Scenario: Correct username and password (SIGN-IN-01)

- **Given** an account with the username "anna"
- **When** the user signs in with "anna" and its password
- **Then** the dashboard of anna's hoard is shown

#### Scenario: Wrong username or password (SIGN-IN-02)

- **Given** a username without an account, or an account and a wrong
  password
- **When** the user signs in with it
- **Then** the user is told "Username or password is incorrect." in both
  cases, and stays signed out

#### Scenario: Too many attempts (SIGN-IN-03)

- **Given** signing in failed too often in a short time
- **When** the user tries again
- **Then** the user is told that signing in is paused for a moment, and is
  not signed in

### Requirement: Only signed-in users reach the hoard

The system MUST NOT show any page behind the login to a signed-out user,
and SHALL lead each user to the page that fits their state.

#### Scenario: Signed out (SIGN-IN-04)

- **Given** the instance is set up and the user is signed out
- **When** the user opens a page behind the login, e.g. the hoard
- **Then** the login is shown instead

#### Scenario: Already signed in (SIGN-IN-05)

- **Given** the user is signed in
- **When** the user opens the login
- **Then** the dashboard is shown instead

#### Scenario: Not set up yet (SIGN-IN-06)

- **Given** no account exists yet
- **When** the user opens the login
- **Then** the setup is shown instead

### Requirement: Stay signed in on a device

The system SHALL keep a user signed in after the browser is closed only if
they chose to stay signed in when signing in.

#### Scenario: Without staying signed in (SIGN-IN-07)

- **Given** the user signed in without "Keep me signed in on this device"
- **When** the user closes the browser and opens Greyhoarder again
- **Then** the login is shown

#### Scenario: Staying signed in (SIGN-IN-08)

- **Given** the user signed in with "Keep me signed in on this device"
- **When** the user closes the browser and opens Greyhoarder again within
  the session's lifetime
- **Then** the user is still signed in

### Requirement: Sign out

The system SHALL end the session when the user signs out.

#### Scenario: Signing out (SIGN-IN-09)

- **Given** the user is signed in
- **When** the user signs out
- **Then** the login is shown, and opening a page behind the login shows
  the login again

## Open questions

- What a user with a disabled account is told when signing in.
- The exact text for too many attempts, and how long the pause lasts.
- Whether the user is taken back to the page they opened before signing in
  instead of the dashboard.
