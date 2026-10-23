import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { YamlCatalogSnapshotSource } from './yaml-catalog-snapshot-source.js';

const ORKS_SYSTEM = `name: Warhammer 40,000
groups:
  xenos: Xenos
factions:
  orks:
    name: Orks
    group: xenos
`;

describe('Catalog files', () => {
  let catalogDirectory: string;

  async function writeCatalog(boyzFile: string): Promise<void> {
    await mkdir(join(catalogDirectory, 'factions'));
    await mkdir(join(catalogDirectory, 'kits/games-workshop/orks'), { recursive: true });
    await writeFile(join(catalogDirectory, 'factions/warhammer-40000.yaml'), ORKS_SYSTEM);
    await writeFile(join(catalogDirectory, 'kits/games-workshop/orks/boyz.yaml'), boyzFile);
  }

  beforeEach(async () => {
    catalogDirectory = await mkdtemp(join(tmpdir(), 'greyhoarder-catalog-'));
  });

  afterEach(async () => {
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

  it('refuses a catalog with a kit file that lacks a required field', async () => {
    await writeCatalog('name: Boyz\nfactions: [warhammer-40000/orks]\n');

    const loading = new YamlCatalogSnapshotSource({ catalogDirectory }).load();

    await expect(loading).rejects.toThrow(/boyz\.yaml/);
  });
});
