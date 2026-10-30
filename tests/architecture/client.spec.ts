import { projectFiles } from 'archunit';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  domainsIn,
  FRAMEWORKS,
  importedModules,
  importsAny,
  importsOnlyInside,
  isRelative,
  PROTOCOL,
} from './imports.js';

const CLIENT_DIR = fileURLToPath(new URL('../../apps/client', import.meta.url));
// The build config, so spec files are not checked (ADR-0024).
const TSCONFIG = resolve(CLIENT_DIR, 'tsconfig.app.json');
const DOMAINS = domainsIn(resolve(CLIENT_DIR, 'src/app/domains'));

describe('Client architecture', () => {
  beforeAll(() => {
    // ArchUnitTS reads file content relative to the working directory.
    process.chdir(CLIENT_DIR);
  });

  // architecture-testing.md, "Architecture tests"
  it('reads every source file with its content', async () => {
    const rule = projectFiles(TSCONFIG)
      .inPath('src/**')
      .should()
      .adhereTo((file) => file.content.length > 0, 'has content');

    await expect(rule).toPassAsync();
  });

  // architecture-boundaries.md, "Domains"
  it.each(DOMAINS)('has no import cycles inside the %s domain', async (domain) => {
    const rule = projectFiles(TSCONFIG).inFolder(`src/app/domains/${domain}/**`).should().haveNoCycles();

    await expect(rule).toPassAsync();
  });

  // architecture-boundaries.md, "Layers inside a client domain"
  it('keeps the model of a domain free of frameworks', async () => {
    const rule = projectFiles(TSCONFIG)
      .inPath('src/app/domains/*/models/**')
      .should()
      .adhereTo((file) => !importsAny(file, FRAMEWORKS), 'imports no framework');

    await expect(rule).toPassAsync();
  });

  // architecture-boundaries.md, "Layers inside a client domain"
  it('keeps every store independent of other stores', async () => {
    const rule = projectFiles(TSCONFIG)
      .inPath('src/app/domains/*/data/**')
      .should()
      .adhereTo(
        (file) =>
          !importedModules(file)
            .filter(isRelative)
            .some((specifier) => specifier.endsWith('-store')),
        'imports no other store',
      );

    await expect(rule).toPassAsync();
  });

  // architecture-boundaries.md, "API protocol"
  it('imports the API protocol only in infrastructure', async () => {
    const rule = projectFiles(TSCONFIG)
      .inPath('src/**', { except: { inPath: 'src/app/domains/*/infrastructure/**' } })
      .should()
      .adhereTo((file) => !importsAny(file, [PROTOCOL]), 'imports no protocol');

    await expect(rule).toPassAsync();
  });

  // architecture-boundaries.md, "Repository layout"
  it('imports nothing outside the client except packages', async () => {
    const rule = projectFiles(TSCONFIG)
      .inPath('src/**')
      .should()
      .adhereTo((file) => importsOnlyInside(CLIENT_DIR, file), 'imports only inside the client');

    await expect(rule).toPassAsync();
  });
});
