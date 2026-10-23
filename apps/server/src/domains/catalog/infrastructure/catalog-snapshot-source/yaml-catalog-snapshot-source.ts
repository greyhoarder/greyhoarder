import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';
import { Inject, Injectable, Logger } from '@nestjs/common';
import type { CatalogFaction, CatalogKit, CatalogSnapshot, GameSystem } from '@greyhoarder/domain/catalog';
import { parse } from 'yaml';
import { z } from 'zod';
import { AppConfig } from '../../../../config/app-config.js';
import { CatalogSnapshotSource } from '../../ports/catalog-snapshot-source.js';
import { kitFileSchema, systemFileSchema } from './catalog-file-schemas.js';

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
    const { systems } = read;
    const groupIds = new Set(systems.flatMap((system) => system.groups.map((group) => `${system.id}/${group.id}`)));
    const factions = this.keepConsistent(read.factions, (faction, factionIds) =>
      factionProblem(faction, groupIds, factionIds),
    );
    const systemIds = new Set(systems.map((system) => system.id));
    const factionIds = new Set(factions.kept.map((faction) => faction.id));
    const kits = this.keepConsistent(readKits.kits, (kit, kitIds) => kitProblem(kit, systemIds, factionIds, kitIds));
    const content = { systems, factions: factions.kept, kits: kits.kept };
    const hash = createHash('sha256').update(JSON.stringify(content)).digest('hex');
    return {
      hash,
      ...content,
      skipped: {
        systemIds: read.skippedSystemIds,
        factionIds: factions.skippedIds,
        kitIds: [...readKits.skippedIds, ...kits.skippedIds],
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

  /**
   * Leaves out every entry with a problem, until the rest only refer to each other: an entry may
   * refer to one that was left out itself.
   */
  private keepConsistent<T extends { readonly id: string }>(
    entries: readonly T[],
    problemOf: (entry: T, keptIds: ReadonlySet<string>) => string | undefined,
  ): { kept: T[]; skippedIds: string[] } {
    let kept = [...entries];
    const skippedIds: string[] = [];
    for (;;) {
      const keptIds = new Set(kept.map((entry) => entry.id));
      const next = kept.filter((entry) => {
        const problem = problemOf(entry, keptIds);
        if (problem !== undefined) {
          this.logger.warn(`Left out ${entry.id} of the catalog: ${problem}`);
          skippedIds.push(entry.id);
        }
        return problem === undefined;
      });
      if (next.length === kept.length) {
        return { kept, skippedIds };
      }
      kept = next;
    }
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

// Every reference must point into the catalog, so the rest of the server can trust it.

function factionProblem(
  faction: CatalogFaction,
  groupIds: ReadonlySet<string>,
  factionIds: ReadonlySet<string>,
): string | undefined {
  if (faction.groupId !== undefined && !groupIds.has(`${faction.systemId}/${faction.groupId}`)) {
    return `unknown group ${faction.groupId}`;
  }
  if (faction.partOfId !== undefined && !factionIds.has(faction.partOfId)) {
    return `unknown partOf ${faction.partOfId}`;
  }
  return undefined;
}

function kitProblem(
  kit: CatalogKit,
  systemIds: ReadonlySet<string>,
  factionIds: ReadonlySet<string>,
  kitIds: ReadonlySet<string>,
): string | undefined {
  const slotFactionIds = kit.variants.flatMap((variant) => variant.slots.flatMap((slot) => slot.factionIds));
  const unknownFaction = [...kit.factionIds, ...slotFactionIds].find((id) => !factionIds.has(id) && !systemIds.has(id));
  if (unknownFaction !== undefined) {
    return `unknown faction ${unknownFaction}`;
  }
  const unknownKit = [kit.supersedesId, ...kit.contains.map((contained) => contained.kitId)].find(
    (id) => id !== undefined && !kitIds.has(id),
  );
  return unknownKit === undefined ? undefined : `unknown kit ${unknownKit}`;
}
