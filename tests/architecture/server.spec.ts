import { projectFiles } from 'archunit';
import { existsSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { domainsIn, FRAMEWORKS, importsAny, importsOnlyInside, PROTOCOL } from './imports.js';

const SERVER_DIR = fileURLToPath(new URL('../../apps/server', import.meta.url));
// The build config, so spec files are not checked (ADR-0024).
const TSCONFIG = resolve(SERVER_DIR, 'tsconfig.build.json');
const DOMAINS = domainsIn(resolve(SERVER_DIR, 'src/domains'));

const SCHEMA_FILE = /-schemas?\.ts$/;
const IN_SCHEMAS_FOLDER = /^src\/domains\/[^/]+\/infrastructure\/[^/]+\/schemas\/[^/]+$/;

function portsOf(domain: string): string[] {
  const folder = `src/domains/${domain}/ports`;
  return existsSync(folder) ? readdirSync(folder).map((file) => file.replace(/\.ts$/, '')) : [];
}

/** `<technology>-<port>.ts` directly in `infrastructure/`, or a folder named after the port. */
function isOrganizedByPort(path: string): boolean {
  const [, , domain, , entry, ...rest] = path.split('/');
  const ports = portsOf(domain);
  if (rest.length === 0) {
    return ports.some((port) => entry.endsWith(`-${port}.ts`));
  }
  return ports.includes(entry);
}

describe('Server architecture', () => {
  beforeAll(() => {
    // ArchUnitTS reads file content relative to the working directory.
    process.chdir(SERVER_DIR);
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
    const rule = projectFiles(TSCONFIG).inFolder(`src/domains/${domain}/**`).should().haveNoCycles();

    await expect(rule).toPassAsync();
  });

  // architecture-boundaries-server.md, "Layers inside a server domain"
  it('keeps the model of a domain free of frameworks', async () => {
    const rule = projectFiles(TSCONFIG)
      .inPath('src/domains/*/models/**')
      .should()
      .adhereTo((file) => !importsAny(file, FRAMEWORKS), 'imports no framework');

    await expect(rule).toPassAsync();
  });

  // architecture-boundaries.md, "API protocol"
  it('imports the API protocol only in features', async () => {
    const rule = projectFiles(TSCONFIG)
      .inPath('src/**', { except: { inPath: 'src/domains/*/features/**' } })
      .should()
      .adhereTo((file) => !importsAny(file, [PROTOCOL]), 'imports no protocol');

    await expect(rule).toPassAsync();
  });

  // architecture-boundaries-server.md, "Layers inside a server domain"
  it('keeps only controllers and services directly in a feature folder', async () => {
    const rule = projectFiles(TSCONFIG)
      .inPath('src/domains/*/features/*/*.ts')
      .should()
      .haveName(/\.(controller|service)\.ts$/);

    await expect(rule).toPassAsync();
  });

  // architecture-boundaries-server.md, "Layers inside a server domain"
  it('organizes infrastructure by port, as <technology>-<port>.ts or in a folder named after the port', async () => {
    const rule = projectFiles(TSCONFIG)
      .inPath('src/domains/*/infrastructure/**')
      .should()
      .adhereTo((file) => isOrganizedByPort(file.path), 'is organized by port');

    await expect(rule).toPassAsync();
  });

  // architecture-boundaries-server.md, "Layers inside a server domain"
  it("keeps adapter schemas in a schemas folder inside their port's folder", async () => {
    const rule = projectFiles(TSCONFIG)
      .inPath('src/domains/**')
      .should()
      .adhereTo(
        (file) => SCHEMA_FILE.test(file.path) === IN_SCHEMAS_FOLDER.test(file.path),
        'schemas are in the schemas folder of a port',
      );

    await expect(rule).toPassAsync();
  });

  // architecture-boundaries-server.md, "Server modules and data ownership"
  it('never refers to another module through forwardRef()', async () => {
    const rule = projectFiles(TSCONFIG)
      .inPath('src/**')
      .should()
      .adhereTo((file) => !/\bforwardRef\s*\(/.test(file.content), 'uses no forwardRef()');

    await expect(rule).toPassAsync();
  });

  // architecture-boundaries-server.md, "Layers inside a server domain"
  it('uses no strings as injection tokens', async () => {
    const rule = projectFiles(TSCONFIG)
      .inPath('src/**')
      .should()
      .adhereTo(
        (file) => !/@Inject\(\s*['"`]/.test(file.content) && !/provide:\s*['"`]/.test(file.content),
        'uses no string tokens',
      );

    await expect(rule).toPassAsync();
  });

  // architecture-boundaries.md, "Repository layout"
  it('imports nothing outside the server except packages', async () => {
    const rule = projectFiles(TSCONFIG)
      .inPath('src/**')
      .should()
      .adhereTo((file) => importsOnlyInside(SERVER_DIR, file), 'imports only inside the server');

    await expect(rule).toPassAsync();
  });
});
