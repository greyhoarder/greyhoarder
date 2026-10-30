// Claude Code PostToolUse hook: formats the one file an Edit or Write
// changed, so the agent never runs Prettier over files it didn't touch.
import { readFile, writeFile } from 'node:fs/promises';
import { isAbsolute, join, relative } from 'node:path';
import * as prettier from 'prettier';

let input = '';
for await (const chunk of process.stdin) input += chunk;
const { tool_input: { file_path: file } = {} } = input ? JSON.parse(input) : {};

const root = process.env.CLAUDE_PROJECT_DIR ?? process.cwd();
const pathInProject = file ? relative(root, file) : '..';
if (pathInProject.startsWith('..') || isAbsolute(pathInProject)) process.exit(0);

const { ignored, inferredParser } = await prettier.getFileInfo(file, {
  ignorePath: [join(root, '.gitignore'), join(root, '.prettierignore')],
});
if (ignored || !inferredParser) process.exit(0);

try {
  const source = await readFile(file, 'utf8');
  const options = await prettier.resolveConfig(file, { editorconfig: true });
  const formatted = await prettier.format(source, { ...options, filepath: file });
  if (formatted !== source) await writeFile(file, formatted);
} catch {
  // A file that doesn't parse yet stays as it is; lint and build report it.
}
