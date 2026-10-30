// Checks the formatting of changed code and runs lint, unit tests and build for the workspaces it
// belongs to, and reports only failures.
// Usable on its own (`npm run check:changed`) or from an agent hook adapter. Markdown never counts as
// code, so docs and design work run nothing.
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../..', import.meta.url));
const lastRunFile = join(root, '.git', 'greyhoarder-sensors');
const failureLines = 30;

const CLIENT = '@greyhoarder/client';
const SERVER = '@greyhoarder/server';
const ARCHITECTURE = '@greyhoarder/architecture';

/** The workspaces a changed path needs checked; libraries are checked through the apps that use them. */
const affected = [
  { prefix: 'apps/client/', workspaces: [CLIENT, ARCHITECTURE] },
  { prefix: 'apps/server/', workspaces: [SERVER, ARCHITECTURE] },
  { prefix: 'libs/domain/', workspaces: ['@greyhoarder/domain', CLIENT, SERVER, ARCHITECTURE] },
  { prefix: 'libs/protocol/', workspaces: ['@greyhoarder/protocol', CLIENT, SERVER, ARCHITECTURE] },
  { prefix: 'tests/architecture/', workspaces: [ARCHITECTURE] },
];

/** Libraries first, since the apps build and test against them. */
const order = ['@greyhoarder/domain', '@greyhoarder/protocol', CLIENT, SERVER, ARCHITECTURE];
const steps = ['build', 'lint', 'test'];

function git(...args) {
  return spawnSync('git', args, { cwd: root, encoding: 'utf8' }).stdout ?? '';
}

/** Changed and new files against the last commit, without Markdown. */
export function changedCodeFiles() {
  const lines = git('status', '--porcelain', '--untracked-files=all').split('\n').filter(Boolean);
  return lines.map((line) => line.slice(3).replace(/^.* -> /, '')).filter((file) => !file.endsWith('.md'));
}

export function workspacesOf(files) {
  const wanted = new Set(
    files.flatMap((file) => affected.find(({ prefix }) => file.startsWith(prefix))?.workspaces ?? []),
  );
  return order.filter((workspace) => wanted.has(workspace));
}

/** Tells one state of the changed code from another, to skip checking the same state twice. */
export function stateOf(files) {
  const hash = createHash('sha256').update(git('diff', 'HEAD', '--', ...files));
  for (const file of files) {
    const path = join(root, file);
    if (existsSync(path)) hash.update(readFileSync(path));
  }
  return hash.digest('hex');
}

export function wasChecked(state) {
  return existsSync(lastRunFile) && readFileSync(lastRunFile, 'utf8') === state;
}

export function rememberChecked(state) {
  writeFileSync(lastRunFile, state);
}

/**
 * Checks the formatting of the changed files, then runs every step each workspace has; returns the
 * failures with the end of their output.
 */
export function runSensors(files, workspaces) {
  const failures = [];
  const existing = files.filter((file) => existsSync(join(root, file)));
  if (existing.length > 0) {
    const run = shell(`npx prettier --check --ignore-unknown ${existing.map((file) => `"${file}"`).join(' ')}`);
    if (run.status !== 0) {
      failures.push({
        workspace: 'changed files',
        step: 'prettier --check',
        output: tail(`${run.stdout}\n${run.stderr}`),
      });
    }
  }
  for (const workspace of workspaces) {
    const scripts = Object.keys(packageOf(workspace).scripts ?? {});
    for (const step of steps.filter((name) => scripts.includes(name))) {
      const run = shell(`npm run ${step} -w ${workspace}`);
      if (run.status !== 0) {
        failures.push({ workspace, step, output: tail(`${run.stdout}\n${run.stderr}`) });
      }
    }
  }
  return failures;
}

/** npm and npx are scripts on Windows, so they run through the shell, as one command line. */
function shell(command) {
  return spawnSync(command, { cwd: root, encoding: 'utf8', shell: true });
}

function packageOf(workspace) {
  const folder = ['apps', 'libs', 'tests']
    .map((parent) => join(root, parent, workspace.replace('@greyhoarder/', '')))
    .find((path) => existsSync(join(path, 'package.json')));
  return folder ? JSON.parse(readFileSync(join(folder, 'package.json'), 'utf8')) : {};
}

function tail(output) {
  const lines = output
    .replace(/\x1b\[[0-9;]*m/g, '')
    .split('\n')
    .map((line) => line.trimEnd())
    .filter((line) => line !== '' && !line.startsWith('npm error') && !line.startsWith('> '));
  return lines.slice(-failureLines).join('\n');
}

export function report(workspaces, failures) {
  if (failures.length === 0) {
    return `Sensors passed: formatting, and build, lint and test of ${workspaces.join(', ') || 'no workspace'}.`;
  }
  return failures.map(({ workspace, step, output }) => `## ${step} failed: ${workspace}\n${output}`).join('\n\n');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const files = changedCodeFiles();
  const workspaces = workspacesOf(files);
  if (files.length === 0) {
    console.log('No code changed; nothing to check.');
    process.exit(0);
  }
  // The stop hook then skips this state.
  rememberChecked(stateOf(files));
  const failures = runSensors(files, workspaces);
  console.log(report(workspaces, failures));
  process.exit(failures.length === 0 ? 0 : 1);
}
