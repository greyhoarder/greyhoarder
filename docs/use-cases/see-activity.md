# Use case: See activity

- **ID:** ACTIVITY
- **Status:** Draft
- **Screens:** [Dashboard](../screens/dashboard.md), section "Activity"
- **Domain rules:** [hoard: Minis](../domains/hoard.md#minis)

## Goal

Right after signing in, the user sees how much they got done in the last
year: on which days minis moved a step, and what happened month by month.

## Not in scope

- Steps from before this feature: they were never recorded and stay
  unknown.
- Changing a mini's status: [PROGRESS](track-progress.md).
- Progress by faction: [OVERVIEW](progress-by-faction.md).

## Requirements

### Requirement: Record the steps of minis

The system SHALL record the day a mini reaches built, primed, painted or
done, once per mini and status. Going back SHALL remove the steps past the
mini's new status. A mini added built or further MUST NOT record a step.
Deleting a mini SHALL remove its steps; a mini leaving the hoard keeps them.

#### Scenario: Two steps at once (ACTIVITY-01)

- **Given** a built mini
- **When** the user sets it to painted
- **Then** primed is not recorded and painted is recorded for today

#### Scenario: Going back (ACTIVITY-02)

- **Given** a mini painted last week
- **When** the user sets it back to primed and to painted again today
- **Then** one painted step is recorded, for today

#### Scenario: Added as painted (ACTIVITY-03)

- **Given** the user adds a mini that is already painted
- **When** it is added
- **Then** no step is recorded

#### Scenario: Deleted (ACTIVITY-04)

- **Given** a mini with 2 recorded steps
- **When** the user deletes it
- **Then** its steps are gone and the days count 2 fewer

### Requirement: Show the last year day by day

The system SHALL show the last 52 weeks with one cell per day, shaded by
the number of steps on that day, and the total of the last year.

#### Scenario: A busy day (ACTIVITY-05)

- **Given** 5 minis were painted and 2 primed today
- **When** the user opens the dashboard
- **Then** today's cell says "7 steps", and the total counts them

#### Scenario: Nothing yet (ACTIVITY-06)

- **Given** no step was recorded
- **When** the user opens the dashboard
- **Then** the empty grid shows "No activity yet. Steps show up here from
  now on."

### Requirement: Show what happened month by month

The system SHALL list per month, newest first, one line per status with
its minis and factions, one line per added box, and offer older months
two at a time. Opening a line SHALL list its minis or boxes.

#### Scenario: A month (ACTIVITY-07)

- **Given** in November 5 Orks were painted, 2 Orks primed and a box of 46
  minis added
- **When** the user opens the dashboard
- **Then** November shows "Painted 5 minis · Orks", "Primed 2 minis ·
  Orks" and "Added 1 box · 46 minis"

#### Scenario: Several factions (ACTIVITY-08)

- **Given** in October 27 minis of Orks and Necrons were finished
- **When** the user opens the dashboard
- **Then** October shows "Finished 27 minis in 2 factions"

#### Scenario: Opening a line (ACTIVITY-09)

- **Given** the line "Painted 5 minis · Orks"
- **When** the user opens it
- **Then** it lists the 5 minis, each a link to its mini

#### Scenario: Older months (ACTIVITY-10)

- **Given** activity in 5 months
- **When** the user presses "Show more activity"
- **Then** two more months are shown

## Open questions

- Whether a day follows the server's or the user's time zone; until
  decided, the server's.
