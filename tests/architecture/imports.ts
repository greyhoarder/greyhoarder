import type { FileInfo } from 'archunit';
import { readdirSync } from 'node:fs';
import { dirname, relative, resolve, sep } from 'node:path';
import ts from 'typescript';

/** Packages counted as frameworks, which `models/` and `libs/domain` never import. */
export const FRAMEWORKS: readonly RegExp[] = [
  /^@angular\//,
  /^@nestjs\//,
  /^nestjs-zod$/,
  /^mongoose(\/|$)/,
  /^rxjs(\/|$)/,
];

export const PROTOCOL = /^@greyhoarder\/protocol(\/|$)/;

/**
 * The module specifiers of a file, read from its content: imports, re-exports,
 * dynamic and type-only imports alike. Packages need not resolve, so this does
 * not depend on the libraries being built.
 */
export function importedModules(file: FileInfo): string[] {
  return ts
    .preProcessFile(file.content, true, true)
    .importedFiles.map((imported) => imported.fileName);
}

export function importsAny(file: FileInfo, patterns: readonly RegExp[]): boolean {
  return importedModules(file).some((specifier) =>
    patterns.some((pattern) => pattern.test(specifier)),
  );
}

export function isRelative(specifier: string): boolean {
  return specifier.startsWith('.');
}

/** Where a relative specifier of the file points, relative to `directory`, with `/` on every platform. */
export function targetOf(file: FileInfo, specifier: string, directory: string): string {
  return relative(directory, resolve(directory, dirname(file.path), specifier))
    .split(sep)
    .join('/');
}

export function importsOnlyInside(directory: string, file: FileInfo): boolean {
  return importedModules(file)
    .filter(isRelative)
    .every((specifier) => !targetOf(file, specifier, directory).startsWith('..'));
}

/** The domain folders inside `directory`. */
export function domainsIn(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !['dist', 'node_modules'].includes(entry.name))
    .map((entry) => entry.name);
}
