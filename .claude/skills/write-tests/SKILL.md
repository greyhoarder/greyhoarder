---
name: write-tests
description: Propose, get approval for, and then write or change unit tests in greyhoarder. Use whenever a component, service or domain rule needs new tests, when existing tests must change or be deleted, or when the stop hook reports components without a spec file.
---

# Write tests

Every test case needs the user's approval **before** it is written, changed
or deleted. Never skip a step, and never edit a spec file before step 4.

1. Read `docs/architecture-testing.md`. It is the source of truth for
   naming, structure and what must be tested.
2. Read the code under test and its existing spec file, if any. Work out
   the behaviors a user or caller can observe.
3. Propose the test cases as a table and stop:

   ```
   ## Test proposal: <unit>
   describe: '<unit in domain terms>'

   | # | Change | it(...) | What is checked, in plain words |
   |---|--------|---------|---------------------------------|
   | 1 | new    | shows "Enter your username." when the form is sent without a username | Given an empty form, when the user signs in, the username error appears. |
   | 2 | change | old: '<old text>' → new: '<new text>' | <why> |
   | 3 | delete | '<text>' | <why> |
   ```

   - Write each `it` for a reader who has not seen the code: one sentence,
     one behavior, no "should", no implementation terms.
   - Only propose behaviors; no tests for private members or framework
     internals.
4. Wait for the user's decision on **each** case: approved, rejected or
   reworded. A general "ok" approves only if it clearly covers all listed
   cases; ask again if it is unclear which cases are approved.
5. Write only the approved cases, with the approved wording verbatim.
   Separate arrange, act and assert with a blank line.
6. Run the tests (`npm test`). If a test fails, report it and propose a
   fix to the code or a change to the test as a new proposal (step 3).
   Never adjust a test just to make it pass.
7. Report which cases were written and which were rejected.
