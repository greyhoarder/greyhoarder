# Use case: Choose the appearance

- **ID:** APPEARANCE
- **Status:** Draft
- **Screens:** [Profile](../screens/profile.md)
- **Domain rules:** [Design system](../design-system.md)

## Goal

The user chooses whether the app looks light or dark, or follows the
system, on the device in use.

## Not in scope

- Settings that follow the account from device to device.

## Requirements

### Requirement: Choose light, dark or the system

The system SHALL apply the chosen appearance at once, follow the system
until the user chooses otherwise, and keep the choice in this browser.

#### Scenario: Dark (APPEARANCE-01)

- **Given** the system is set to light
- **When** the user chooses "Dark"
- **Then** the app turns dark at once

#### Scenario: Following the system (APPEARANCE-02)

- **Given** the user never chose an appearance
- **When** the system changes from light to dark
- **Then** the app turns dark

#### Scenario: After reloading (APPEARANCE-03)

- **Given** the user chose "Dark" while the system is set to light
- **When** the app is opened again in the same browser
- **Then** it opens dark, without showing the light look first

#### Scenario: Another device (APPEARANCE-04)

- **Given** the user chose "Dark" in one browser
- **When** the user signs in in another browser
- **Then** that browser follows its own system
