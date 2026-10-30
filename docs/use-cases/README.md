# Use cases

One file per use case: what the user wants to reach, across which screens,
and the acceptance criteria that tell whether it works. Read the file of the
use case you build or change; how its screens look is in
[docs/screens/](../screens/README.md), the rules that always hold in
[docs/domains/](../domains/README.md).

| ID | Use case | Status |
|----|----------|--------|
| `ADD-MINIS` | [Add minis from the catalog](add-minis.md) | Draft |

## When a spec is needed

- New features and changed behavior need the spec of their use case
  first: written or changed, then approved by the user, then tests derived
  from its acceptance criteria, then the code.
- Bug fixes with a test that reproduces the bug, refactorings and changes
  of look only need none.
- An existing use case without a spec gets one when it is next changed.
- Agents may draft and change specs, but only the user sets the status to
  `Approved`. A changed spec is `Draft` again until the user approves it.

_(derived from [ADR-0027](../adr/0027-use-case-specs-with-acceptance-criteria.md))_

## Writing a spec

- One use case per file, named after it in kebab-case
  (`add-minis.md`), and listed in the table above.
- A use case is one goal of the user, e.g. adding minis from the catalog;
  not a screen, a component or an endpoint.
- Keep it to about a screen page. Link to screens and domain rules instead
  of repeating them: the use case says what the user reaches and how
  success shows; the screen spec says how the screen looks and which states
  it has; the domain doc says which rules always hold.
- Describe behavior a user can observe, in the terms of the domain docs;
  no components, endpoints, signals or other implementation terms.
- Write each requirement in normative language: SHALL or MUST.
- Each requirement has at least one scenario; each scenario is one
  acceptance criterion with **Given**, **When** and **Then**.
- List what is unclear under "Open questions" instead of guessing.
- Update a spec in place, in the same commit as the code and tests that
  change its behavior; there are no change or delta files.

_(derived from [ADR-0027](../adr/0027-use-case-specs-with-acceptance-criteria.md))_

## IDs

- Each use case has an ID in upper-case kebab-case, e.g. `ADD-MINIS`.
- Each scenario has the ID of its use case and a two-digit number, e.g.
  `ADD-MINIS-03`, in parentheses after its name.
- IDs are never changed, reused or renumbered. A new scenario gets the next
  free number; the number of a removed scenario stays unused.

_(derived from [ADR-0027](../adr/0027-use-case-specs-with-acceptance-criteria.md))_

## Template

```markdown
# Use case: <name>

- **ID:** <USE-CASE-ID>
- **Status:** Draft | Approved
- **Screens:** <links to the screen specs it runs over>
- **Domain rules:** <links to the domain rules it relies on>

## Goal

<What the user wants to reach, in one or two sentences.>

## Not in scope

- <What this use case does not cover, and where it is covered.>

## Requirements

### Requirement: <name>

The system SHALL <behavior>.

#### Scenario: <name> (<USE-CASE-ID>-01)

- **Given** <situation>
- **When** <action of the user>
- **Then** <outcome the user can observe>

## Open questions

- <What is not decided yet.>
```
