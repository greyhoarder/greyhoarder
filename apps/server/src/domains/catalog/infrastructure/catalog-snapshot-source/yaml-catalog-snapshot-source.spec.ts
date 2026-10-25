import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Logger } from '@nestjs/common';
import { YamlCatalogSnapshotSource } from './yaml-catalog-snapshot-source.js';

const ORKS_SYSTEM = `name: Warhammer 40,000
groups:
  xenos: Xenos
factions:
  orks:
    name: Orks
    group: xenos
`;

const NOBZ = 'name: Nobz\nfactions: [warhammer-40000/orks]\nminis: 5\n';

describe('Catalog files', () => {
  let catalogDirectory: string;

  async function writeCatalog(boyzFile: string, otherKits: Record<string, string> = {}): Promise<void> {
    await mkdir(join(catalogDirectory, 'factions'));
    await mkdir(join(catalogDirectory, 'kits/games-workshop/orks'), { recursive: true });
    await writeFile(join(catalogDirectory, 'factions/warhammer-40000.yaml'), ORKS_SYSTEM);
    await writeFile(join(catalogDirectory, 'kits/games-workshop/orks/boyz.yaml'), boyzFile);
    for (const [name, file] of Object.entries(otherKits)) {
      await writeFile(join(catalogDirectory, `kits/games-workshop/orks/${name}.yaml`), file);
    }
  }

  const loadCatalog = () => new YamlCatalogSnapshotSource({ catalogDirectory }).load();

  beforeEach(async () => {
    catalogDirectory = await mkdtemp(join(tmpdir(), 'greyhoarder-catalog-'));
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await rm(catalogDirectory, { recursive: true, force: true });
  });

  it('reads a kit with its id, manufacturer and factions from its path and file', async () => {
    await writeCatalog('name: Boyz\nfactions: [warhammer-40000/orks]\nminis: 10\ndraft: true\n');

    const snapshot = await new YamlCatalogSnapshotSource({ catalogDirectory }).load();

    expect(snapshot.kits).toEqual([
      expect.objectContaining({
        id: 'games-workshop/orks/boyz',
        manufacturer: 'games-workshop',
        factionIds: ['warhammer-40000/orks'],
        isDraft: true,
      }),
    ]);
  });

  it('leaves out a kit file that lacks a required field and reads the rest', async () => {
    await writeCatalog('name: Boyz\nfactions: [warhammer-40000/orks]\n', { nobz: NOBZ });

    const snapshot = await loadCatalog();

    expect(snapshot.kits.map((kit) => kit.id)).toEqual(['games-workshop/orks/nobz']);
    expect(snapshot.skipped.kitIds).toEqual(['games-workshop/orks/boyz']);
  });

  it('loads a kit with a field it does not know', async () => {
    const warn = vi.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
    await writeCatalog('name: Boyz\naliases: [Ork Boyz]\nfactions: [warhammer-40000/orks]\nminis: 10\n');

    const snapshot = await loadCatalog();

    expect(snapshot.kits.map((kit) => kit.id)).toEqual(['games-workshop/orks/boyz']);
    expect(snapshot.skipped.kitIds).toEqual([]);
    expect(warn).not.toHaveBeenCalled();
  });

  it('leaves out a kit that refers to an unknown faction', async () => {
    await writeCatalog('name: Boyz\nfactions: [warhammer-40000/grots]\nminis: 10\n');

    const snapshot = await loadCatalog();

    expect(snapshot.kits).toEqual([]);
    expect(snapshot.skipped.kitIds).toEqual(['games-workshop/orks/boyz']);
  });

  it('leaves out a kit that contains a kit that was left out', async () => {
    await writeCatalog('name: Boyz\nfactions: [warhammer-40000/orks]\n', {
      bundle: 'name: Bundle\nfactions: [warhammer-40000/orks]\nminis: 10\ncontains:\n  - kit: games-workshop/orks/boyz\n    count: 1\n',
    });

    const snapshot = await loadCatalog();

    expect(snapshot.kits).toEqual([]);
    expect(snapshot.skipped.kitIds).toEqual(['games-workshop/orks/boyz', 'games-workshop/orks/bundle']);
  });

  it('warns in the log about every part it leaves out', async () => {
    const warn = vi.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
    await writeCatalog('name: Boyz\nfactions: [warhammer-40000/orks]\n');

    await loadCatalog();

    expect(warn).toHaveBeenCalledWith(expect.stringContaining('boyz.yaml'));
  });
});
