import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';
import { Inject, Injectable, Logger } from '@nestjs/common';
import type { CatalogKit } from '@greyhoarder/domain/catalog';
import { parse } from 'yaml';
import { z } from 'zod';
import { AppConfig } from '../../../../config/app-config.js';
import type { CatalogFaction } from '../../models/catalog-faction.js';
import { type CatalogSnapshot, withResolvedReferences } from '../../models/catalog-snapshot.js';
import type { GameSystem } from '../../models/game-system.js';
import { CatalogSnapshotSource } from '../../ports/catalog-snapshot-source.js';
import { kitFileSchema, systemFileSchema } from './schemas/catalog-file-schemas.js';

/**
 * Reads the YAML files of the catalog submodule; ranges are left out (ADR-0020). Files and
 * entries that don't match the format are left out with a warning, so the server still starts.
 */
@Injectable()
export class YamlCatalogSnapshotSource extends CatalogSnapshotSource {
  private readonly logger = new Logger(YamlCatalogSnapshotSource.name);

  constructor(@Inject(AppConfig) private readonly config: Pick<AppConfig, 'catalogDirectory'>) {
    super();
  }

  async load(): Promise<CatalogSnapshot> {
    const [read, readKits] = await Promise.all([this.readSystems(), this.readKits()]);
    const resolved = withResolvedReferences({ systems: read.systems, factions: read.factions, kits: readKits.kits });
    for (const { id, problem } of [...resolved.leftOutFactions, ...resolved.leftOutKits]) {
      this.logger.warn(`Left out ${id} of the catalog: ${problem}`);
    }
    const content = { systems: read.systems, factions: resolved.factions, kits: resolved.kits };
    const hash = createHash('sha256').update(JSON.stringify(content)).digest('hex');
    return {
      hash,
      ...content,
      skipped: {
        systemIds: read.skippedSystemIds,
        factionIds: resolved.leftOutFactions.map(({ id }) => id),
        kitIds: [...readKits.skippedIds, ...resolved.leftOutKits.map(({ id }) => id)],
      },
    };
  }

  private async readSystems(): Promise<{
    systems: GameSystem[];
    factions: CatalogFaction[];
    skippedSystemIds: string[];
  }> {
    const directory = join(this.config.catalogDirectory, 'factions');
    const systems: GameSystem[] = [];
    const factions: CatalogFaction[] = [];
    const skippedSystemIds: string[] = [];
    for (const file of await yamlFiles(directory)) {
      const systemId = idOf(directory, file);
      const content = await this.readYaml(file, systemFileSchema);
      if (content === undefined) {
        skippedSystemIds.push(systemId);
        continue;
      }
      systems.push({
        id: systemId,
        name: content.name,
        groups: Object.entries(content.groups).map(([id, name]) => ({ id, name })),
      });
      for (const [id, faction] of Object.entries(content.factions)) {
        factions.push({
          id: `${systemId}/${id}`,
          systemId,
          name: faction.name,
          groupId: faction.group,
          partOfId: faction.partOf === undefined ? undefined : `${systemId}/${faction.partOf}`,
        });
      }
    }
    return { systems, factions, skippedSystemIds };
  }

  private async readKits(): Promise<{ kits: CatalogKit[]; skippedIds: string[] }> {
    const directory = join(this.config.catalogDirectory, 'kits');
    const kits: CatalogKit[] = [];
    const skippedIds: string[] = [];
    for (const file of await yamlFiles(directory)) {
      const id = idOf(directory, file);
      const content = await this.readYaml(file, kitFileSchema);
      if (content === undefined) {
        skippedIds.push(id);
        continue;
      }
      kits.push({
        id,
        manufacturer: id.split('/')[0] ?? id,
        name: content.name,
        factionIds: content.factions,
        releases: content.releases,
        minis: content.minis,
        isDraft: content.draft,
        supersedesId: content.supersedes,
        contains: content.contains.map((contained) => ({ kitId: contained.kit, count: contained.count })),
        variants: content.variants.map((variant) => ({
          name: variant.name,
          slots: variant.slots.map((slot) => ({
            count: slot.count,
            buildsAs: slot.buildsAs,
            parts: slot.parts,
            factionIds: slot.factions,
          })),
        })),
      });
    }
    return { kits, skippedIds };
  }

  /** `undefined` for a file that doesn't match the format. */
  private async readYaml<T>(file: string, schema: z.ZodType<T>): Promise<T | undefined> {
    const result = schema.safeParse(parse(await readFile(file, 'utf8')));
    if (!result.success) {
      this.logger.warn(`Left out ${file}, it does not match the catalog format:\n${z.prettifyError(result.error)}`);
      return undefined;
    }
    return result.data;
  }
}

/** Sorted, so the same files always give the same hash. */
async function yamlFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { recursive: true, withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.yaml'))
    .map((entry) => join(entry.parentPath, entry.name))
    .sort();
}

/** The path below `directory` without the extension, with forward slashes. */
function idOf(directory: string, file: string): string {
  return relative(directory, file).slice(0, -'.yaml'.length).split(sep).join('/');
}
