// Lists Angular components that have no spec file next to them (ADR-0012).
// Usable on its own (`npm run check:specs`) or from an agent hook adapter.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../..', import.meta.url));
const sourceRoots = ['apps/client/src'];
const skippedDirs = new Set(['node_modules', 'helm']);

function* typeScriptFiles(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!skippedDirs.has(entry.name)) yield* typeScriptFiles(join(dir, entry.name));
    } else if (entry.name.endsWith('.ts') && !entry.name.endsWith('.spec.ts')) {
      yield join(dir, entry.name);
    }
  }
}

export function findComponentsWithoutSpec() {
  const missing = [];
  for (const sourceRoot of sourceRoots) {
    const dir = join(root, sourceRoot);
    if (!existsSync(dir)) continue;
    for (const file of typeScriptFiles(dir)) {
      const isComponent = /@Component\s*\(/.test(readFileSync(file, 'utf8'));
      if (isComponent && !existsSync(file.replace(/\.ts$/, '.spec.ts'))) {
        missing.push(relative(root, file).replaceAll('\\', '/'));
      }
    }
  }
  return missing;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const missing = findComponentsWithoutSpec();
  if (missing.length > 0) {
    console.error(`Components without a spec file:\n${missing.map((f) => `- ${f}`).join('\n')}`);
    process.exit(1);
  }
  console.log('Every component has a spec file.');
}
