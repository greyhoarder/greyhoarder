// Claude Code stop hook: adapter around the shared checks in scripts/checks/.
// Exit code 2 sends the message back to the agent, which then keeps working.
import { findComponentsWithoutSpec } from '../checks/component-specs.mjs';

let input = '';
for await (const chunk of process.stdin) input += chunk;
const { stop_hook_active: alreadyContinued = false } = input ? JSON.parse(input) : {};

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
