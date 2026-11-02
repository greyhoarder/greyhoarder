// Claude Code PostToolUse hook: formats the one file an Edit or Write
// changed, so the agent never runs oxfmt over files it didn't touch.
import { spawnSync } from 'node:child_process';
import { isAbsolute, join, relative } from 'node:path';

let input = '';
for await (const chunk of process.stdin) input += chunk;
const { tool_input: { file_path: file } = {} } = input ? JSON.parse(input) : {};

const root = process.env.CLAUDE_PROJECT_DIR ?? process.cwd();
const pathInProject = file ? relative(root, file) : '..';
if (pathInProject.startsWith('..') || isAbsolute(pathInProject)) process.exit(0);

// oxfmt skips ignored and unknown files itself (.oxfmtrc.json, .gitignore). A file that doesn't
// parse yet stays as it is; lint and build report it. Its script runs directly, without npx and a
// shell, as that would take longer than formatting.
spawnSync(
  process.execPath,
  [join(root, 'node_modules/oxfmt/bin/oxfmt'), '--no-error-on-unmatched-pattern', pathInProject],
  {
    cwd: root,
    stdio: 'ignore',
  },
);
