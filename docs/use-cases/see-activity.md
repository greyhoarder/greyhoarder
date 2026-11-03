# Use case: See activity

- **ID:** ACTIVITY
- **Status:** Draft
- **Screens:** [Dashboard](../screens/dashboard.md), section "Activity"
- **Domain rules:** [hoard: Minis](../domains/hoard.md#minis)

## Goal

Right after signing in, the user sees how much they got done in a year: on which days minis moved a step, and what happened month by month.

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

### Requirement: Show a year day by day

The system SHALL show a year from January to December, the current one
unless the user chooses another, with one cell per day, shaded by
the number of steps on that day, and their total. It SHALL offer the current year
and every year with activity.

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
one entry at a time on request, none at first, of the shown year. Opening a line SHALL list its armies or boxes with their minis.

#### Scenario: A month (ACTIVITY-07)

- **Given** in November 5 Orks were painted, 2 Orks primed and a box of 46
  minis added
- **When** the user opens the dashboard
- **Then** November shows "Painted 5 minis in 1 faction", "Primed 2 minis
  in 1 faction" and "Added 1 box"

#### Scenario: Several factions (ACTIVITY-08)

- **Given** in October 27 minis of Orks and Necrons were finished
- **When** the user opens the dashboard
- **Then** October shows "Finished 27 minis in 2 factions"

#### Scenario: Rows of an entry (ACTIVITY-09)

- **Given** in October 20 Orks and 7 Necrons were painted
- **When** the user opens "Painted 27 minis in 2 factions"
- **Then** it lists "Orks 20 minis" above
  "Necrons 7 minis"; added boxes list each box as a link to it

#### Scenario: Older months (ACTIVITY-10)

- **Given** activity in 5 months
- **When** the user presses "Show more activity"
- **Then** the next entry is shown, a new month when it comes to one

#### Scenario: Summary of a year (ACTIVITY-12)

- **Given** in 2026 2 boxes of 30 minis were added, 12 minis painted and 3
  finished, on 4 days of which 3 in a row
- **When** the user opens the dashboard
- **Then** the summary says 2 boxes added with 30 minis, 12 minis painted
  with 3 finished, 4 active days of the days so far and a streak of 3 days

#### Scenario: An earlier year (ACTIVITY-11)

- **Given** steps in 2025 and 2026
- **When** the user chooses 2025
- **Then** the heatmap, the total and the months are those of 2025

## Open questions

- Whether a day follows the server's or the user's time zone; until
  decided, the server's.
