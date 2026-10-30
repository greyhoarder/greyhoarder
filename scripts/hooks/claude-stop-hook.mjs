// Claude Code stop hook: adapter around the shared checks in scripts/checks/.
// Exit code 2 sends the message back to the agent, which then keeps working.
import { findComponentsWithoutSpec } from '../checks/component-specs.mjs';
import {
  changedCodeFiles,
  rememberChecked,
  report,
  runSensors,
  stateOf,
  wasChecked,
  workspacesOf,
} from '../checks/sensors.mjs';

let input = '';
for await (const chunk of process.stdin) input += chunk;
const { stop_hook_active: alreadyContinued = false } = input ? JSON.parse(input) : {};

// Sensors: every new state of changed code is checked once; docs and design work run nothing.
const files = changedCodeFiles();
const workspaces = workspacesOf(files);
if (files.length > 0) {
  const state = stateOf(files);
  if (!wasChecked(state)) {
    rememberChecked(state);
    const failures = runSensors(files, workspaces);
    if (failures.length > 0) {
      console.error(
        [
          report(workspaces, failures),
          '',
          'Fix the cause, or report the failure to the user if it is not yours to fix.',
          'Never change a test just to make it pass.',
        ].join('\n'),
      );
      process.exit(2);
    }
  }
}

// Report once per stop; the agent needs the user's approval to add tests,
// so blocking again would only loop.
if (alreadyContinued) process.exit(0);

const missing = findComponentsWithoutSpec();
if (missing.length > 0) {
  console.error(
    [
      'These components have no spec file (ADR-0012):',
      ...missing.map((file) => `- ${file}`),
      'Use the write-tests skill: propose test cases and wait for the user to approve each one.',
      'Do not write spec files without approval.',
    ].join('\n'),
  );
  process.exit(2);
}
