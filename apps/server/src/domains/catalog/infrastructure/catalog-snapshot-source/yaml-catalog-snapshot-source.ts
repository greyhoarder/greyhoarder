import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';
import { Inject, Injectable } from '@nestjs/common';
import type { CatalogFaction, CatalogKit, CatalogSnapshot, GameSystem } from '@greyhoarder/domain/catalog';
import { parse } from 'yaml';
import { z } from 'zod';
import { AppConfig } from '../../../../config/app-config.js';
import { CatalogSnapshotSource } from '../../ports/catalog-snapshot-source.js';
import { CatalogFormatError } from '../../util/catalog-format.error.js';
import { kitFileSchema, systemFileSchema } from './catalog-file-schemas.js';

/** Reads the YAML files of the catalog submodule; ranges are left out (ADR-0020). */
@Injectable()
export class YamlCatalogSnapshotSource extends CatalogSnapshotSource {
  constructor(@Inject(AppConfig) private readonly config: Pick<AppConfig, 'catalogDirectory'>) {
    super();
  }

  async load(): Promise<CatalogSnapshot> {
    const [{ systems, factions }, kits] = await Promise.all([this.readSystems(), this.readKits()]);
    checkReferences(systems, factions, kits);
    const hash = createHash('sha256').update(JSON.stringify({ systems, factions, kits })).digest('hex');
    return { hash, systems, factions, kits };
  }

  private async readSystems(): Promise<{ systems: GameSystem[]; factions: CatalogFaction[] }> {
    const directory = join(this.config.catalogDirectory, 'factions');
    const systems: GameSystem[] = [];
    const factions: CatalogFaction[] = [];
    for (const file of await yamlFiles(directory)) {
      const systemId = idOf(directory, file);
      const content = await readYaml(file, systemFileSchema);
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
    return { systems, factions };
  }

  private async readKits(): Promise<CatalogKit[]> {
    const directory = join(this.config.catalogDirectory, 'kits');
    const kits: CatalogKit[] = [];
    for (const file of await yamlFiles(directory)) {
      const id = idOf(directory, file);
      const content = await readYaml(file, kitFileSchema);
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
    return kits;
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

async function readYaml<T>(file: string, schema: z.ZodType<T>): Promise<T> {
  const result = schema.safeParse(parse(await readFile(file, 'utf8')));
  if (!result.success) {
    throw new CatalogFormatError([`${file}:\n${z.prettifyError(result.error)}`]);
  }
  return result.data;
}

/** The path below `directory` without the extension, with forward slashes. */
function idOf(directory: string, file: string): string {
  return relative(directory, file).slice(0, -'.yaml'.length).split(sep).join('/');
}

/** Every reference must point into the catalog, so the rest of the server can trust it. */
function checkReferences(systems: GameSystem[], factions: CatalogFaction[], kits: CatalogKit[]): void {
  const systemIds = new Set(systems.map((system) => system.id));
  const factionIds = new Set(factions.map((faction) => faction.id));
  const kitIds = new Set(kits.map((kit) => kit.id));
  const groupIds = new Set(systems.flatMap((system) => system.groups.map((group) => `${system.id}/${group.id}`)));
  const problems: string[] = [];

  for (const faction of factions) {
    if (faction.groupId !== undefined && !groupIds.has(`${faction.systemId}/${faction.groupId}`)) {
      problems.push(`faction ${faction.id}: unknown group ${faction.groupId}`);
    }
    if (faction.partOfId !== undefined && !factionIds.has(faction.partOfId)) {
      problems.push(`faction ${faction.id}: unknown partOf ${faction.partOfId}`);
    }
  }
  for (const kit of kits) {
    const slotFactionIds = kit.variants.flatMap((variant) => variant.slots.flatMap((slot) => slot.factionIds));
    for (const factionId of [...kit.factionIds, ...slotFactionIds]) {
      if (!factionIds.has(factionId) && !systemIds.has(factionId)) {
        problems.push(`kit ${kit.id}: unknown faction ${factionId}`);
      }
    }
    for (const kitId of [kit.supersedesId, ...kit.contains.map((contained) => contained.kitId)]) {
      if (kitId !== undefined && !kitIds.has(kitId)) {
        problems.push(`kit ${kit.id}: unknown kit ${kitId}`);
      }
    }
  }
  if (problems.length > 0) {
    throw new CatalogFormatError(problems);
  }
}
