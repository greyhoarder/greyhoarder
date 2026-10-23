import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import type { CatalogFaction, CatalogKit, CatalogUpdate, GameSystem } from '@greyhoarder/domain/catalog';
import type { ClientSession, Connection, Model } from 'mongoose';
import { type CatalogImport, CatalogRepository, type ImportedCatalog } from '../../ports/catalog-repository.js';
import { CatalogFactionDbo, CatalogImportDbo, CatalogKitDbo, GameSystemDbo } from './mongo-catalog-schemas.js';

const LATEST = { isLatest: true } as const;

/** Copies only the fields of the domain models, so `_id`, flags and timestamps stay here. */
function toGameSystem(stored: GameSystemDbo): GameSystem {
  return {
    id: stored.systemId,
    name: stored.name,
    groups: stored.groups.map((group) => ({ id: group.id, name: group.name })),
  };
}

function toCatalogFaction(stored: CatalogFactionDbo): CatalogFaction {
  return {
    id: stored.factionId,
    systemId: stored.systemId,
    name: stored.name,
    groupId: stored.groupId,
    partOfId: stored.partOfId,
  };
}

function toCatalogKit(stored: CatalogKitDbo): CatalogKit {
  return {
    id: stored.kitId,
    manufacturer: stored.manufacturer,
    name: stored.name,
    factionIds: stored.factionIds,
    releases: stored.releases.map((release) => ({ year: release.year, sku: release.sku, barcode: release.barcode })),
    minis: stored.minis,
    isDraft: stored.isDraft,
    supersedesId: stored.supersedesId,
    contains: stored.contains.map((contained) => ({ kitId: contained.kitId, count: contained.count })),
    variants: stored.variants.map((variant) => ({
      name: variant.name,
      slots: variant.slots.map((slot) => ({
        count: slot.count,
        buildsAs: slot.buildsAs,
        parts: slot.parts,
        factionIds: slot.factionIds,
      })),
    })),
  };
}

/** One collection of versioned entries and how an entry becomes its document. */
interface VersionedCollection<T extends { readonly id: string }, D> {
  readonly model: Model<D>;
  readonly idField: keyof D & string;
  readonly toDocument: (entry: T) => object;
}

/** MongoDB adapter for the imported catalog. */
@Injectable()
export class MongoCatalogRepository extends CatalogRepository {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(GameSystemDbo.name) private readonly systems: Model<GameSystemDbo>,
    @InjectModel(CatalogFactionDbo.name) private readonly factions: Model<CatalogFactionDbo>,
    @InjectModel(CatalogKitDbo.name) private readonly kits: Model<CatalogKitDbo>,
    @InjectModel(CatalogImportDbo.name) private readonly imports: Model<CatalogImportDbo>,
  ) {
    super();
  }

  async findLastSnapshotHash(): Promise<string | undefined> {
    const last = await this.imports.findOne().sort({ createdAt: -1 }).lean().exec();
    return last?.snapshotHash;
  }

  async findImported(): Promise<ImportedCatalog> {
    const [systems, factions, kits] = await Promise.all([
      this.systems.find(LATEST).lean().exec(),
      this.factions.find(LATEST).lean().exec(),
      this.kits.find(LATEST).lean().exec(),
    ]);
    return {
      systems: systems.map((stored) => ({ entry: toGameSystem(stored), ...versionFlags(stored) })),
      factions: factions.map((stored) => ({ entry: toCatalogFaction(stored), ...versionFlags(stored) })),
      kits: kits.map((stored) => ({ entry: toCatalogKit(stored), ...versionFlags(stored) })),
    };
  }

  async searchKits(text: string, limit: number): Promise<CatalogKit[]> {
    const contains = new RegExp(escapeRegExp(text), 'i');
    const kits = await this.kits
      .find({
        ...LATEST,
        isRemoved: false,
        $or: [{ name: contains }, { 'releases.sku': contains }, { 'releases.barcode': contains }],
      })
      .sort({ name: 1, kitId: 1 })
      .limit(limit)
      .lean()
      .exec();
    return kits.map(toCatalogKit);
  }

  async findFactionNames(ids: readonly string[]): Promise<ReadonlyMap<string, string>> {
    const [systems, factions] = await Promise.all([
      this.systems.find({ ...LATEST, systemId: { $in: ids } }).lean().exec(),
      this.factions.find({ ...LATEST, factionId: { $in: ids } }).lean().exec(),
    ]);
    return new Map([
      ...systems.map((system) => [system.systemId, system.name] as const),
      ...factions.map((faction) => [faction.factionId, faction.name] as const),
    ]);
  }

  async applyImport(catalogImport: CatalogImport): Promise<void> {
    await this.connection.transaction(async (session) => {
      await this.applyUpdate(
        { model: this.systems, idField: 'systemId', toDocument: ({ id, ...content }) => ({ systemId: id, ...content }) },
        catalogImport.systems,
        session,
      );
      await this.applyUpdate(
        { model: this.factions, idField: 'factionId', toDocument: ({ id, ...content }) => ({ factionId: id, ...content }) },
        catalogImport.factions,
        session,
      );
      await this.applyUpdate(
        { model: this.kits, idField: 'kitId', toDocument: ({ id, ...content }) => ({ kitId: id, ...content }) },
        catalogImport.kits,
        session,
      );
      await this.imports.create([{ snapshotHash: catalogImport.snapshotHash }], { session });
    });
  }

  /** The previous latest version stays as it is; only its flags move to the new one. */
  private async applyUpdate<T extends { readonly id: string }, D>(
    collection: VersionedCollection<T, D>,
    update: CatalogUpdate<T>,
    session: ClientSession,
  ): Promise<void> {
    const latestOf = (ids: readonly string[]) => ({ ...LATEST, [collection.idField]: { $in: ids } });
    await collection.model.updateMany(latestOf(update.versions.map(({ entry }) => entry.id)), { isLatest: false }, { session });
    await collection.model.insertMany(
      update.versions.map(({ entry, version }) => ({
        ...collection.toDocument(entry),
        version,
        isLatest: true,
        isRemoved: false,
      })),
      { session },
    );
    await collection.model.updateMany(latestOf(update.removedIds), { isRemoved: true }, { session });
    await collection.model.updateMany(latestOf(update.restoredIds), { isRemoved: false }, { session });
  }
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function versionFlags(stored: { version: number; isRemoved: boolean }): { version: number; isRemoved: boolean } {
  return { version: stored.version, isRemoved: stored.isRemoved };
}
