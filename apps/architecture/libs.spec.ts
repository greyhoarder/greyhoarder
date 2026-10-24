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
  targetOf,
} from './imports.js';

const DOMAIN_DIR = fileURLToPath(new URL('../../libs/domain', import.meta.url));
const PROTOCOL_DIR = fileURLToPath(new URL('../../libs/protocol', import.meta.url));

/** The rules both libraries share. Each library is a project of its own with its own tsconfig. */
function itFollowsLibraryRules(directory: string): void {
  const tsconfig = resolve(directory, 'tsconfig.json');

  beforeAll(() => {
    // ArchUnitTS reads file content relative to the working directory.
    process.chdir(directory);
  });

  // architecture-testing.md, "Architecture tests"
  it('reads every source file with its content', async () => {
    const rule = projectFiles(tsconfig)
      .inPath('**')
      .should()
      .adhereTo((file) => file.content.length > 0, 'has content');

    await expect(rule).toPassAsync();
  });

  // architecture-boundaries.md, "Domains"
  it.each(domainsIn(directory))('has no import cycles inside the %s domain', async (domain) => {
    const rule = projectFiles(tsconfig).inFolder(`${domain}/**`).should().haveNoCycles();

    await expect(rule).toPassAsync();
  });

  // architecture-boundaries.md, "Repository layout"
  it('imports nothing outside the library except packages', async () => {
    const rule = projectFiles(tsconfig)
      .inPath('**')
      .should()
      .adhereTo((file) => importsOnlyInside(directory, file), 'imports only inside the library');

    await expect(rule).toPassAsync();
  });

  // architecture-boundaries.md, "Shared domain models" and "API protocol"
  it('lets domains import each other only through their index.ts', async () => {
    const rule = projectFiles(tsconfig)
      .inPath('**')
      .should()
      .adhereTo((file) => {
        const ownDomain = file.path.split('/')[0];
        return importedModules(file)
          .filter(isRelative)
          .map((specifier) => targetOf(file, specifier, directory))
          .every(
            (target) => target.split('/')[0] === ownDomain || /^[^/]+\/index\.js$/.test(target),
          );
      }, 'imports other domains through their index.ts');

    await expect(rule).toPassAsync();
  });
}

describe('Shared domain models', () => {
  itFollowsLibraryRules(DOMAIN_DIR);

  // architecture-boundaries.md, "Shared domain models"
  it('keeps the shared model free of frameworks', async () => {
    const rule = projectFiles(resolve(DOMAIN_DIR, 'tsconfig.json'))
      .inPath('**')
      .should()
      .adhereTo((file) => !importsAny(file, FRAMEWORKS), 'imports no framework');

    await expect(rule).toPassAsync();
  });
});

describe('API protocol', () => {
  itFollowsLibraryRules(PROTOCOL_DIR);

  // architecture-boundaries.md, "API protocol"
  it('depends on no package except zod and @greyhoarder/domain', async () => {
    const rule = projectFiles(resolve(PROTOCOL_DIR, 'tsconfig.json'))
      .inPath('**')
      .should()
      .adhereTo(
        (file) =>
          importedModules(file)
            .filter((specifier) => !isRelative(specifier))
            .every(
              (specifier) => specifier === 'zod' || specifier.startsWith('@greyhoarder/domain/'),
            ),
        'depends only on zod and @greyhoarder/domain',
      );

    await expect(rule).toPassAsync();
  });
});
