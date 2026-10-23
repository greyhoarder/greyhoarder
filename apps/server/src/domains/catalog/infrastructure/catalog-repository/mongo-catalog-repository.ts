import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import type { CatalogKit, CatalogUpdate } from '@greyhoarder/domain/catalog';
import type { ClientSession, Connection, Model } from 'mongoose';
import type { CatalogKitQueries } from '../../ports/catalog-kit-queries.js';
import { type CatalogImport, CatalogRepository, type ImportedCatalog } from '../../ports/catalog-repository.js';
import { toCatalogFaction, toCatalogKit, toGameSystem, toVersionedEntry } from './mongo-catalog-mappers.js';
import { CatalogFactionDbo, CatalogImportDbo, CatalogKitDbo, GameSystemDbo } from './mongo-catalog-schemas.js';

const LATEST = { isLatest: true } as const;

/** One collection of versioned entries and the field that holds an entry's id. */
interface VersionedCollection<D> {
  readonly model: Model<D>;
  readonly idField: keyof D & string;
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** MongoDB adapter for both catalog ports: the import's repository and the read-only kit queries. */
@Injectable()
export class MongoCatalogRepository extends CatalogRepository implements CatalogKitQueries {
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
      systems: systems.map((stored) => toVersionedEntry(stored, toGameSystem)),
      factions: factions.map((stored) => toVersionedEntry(stored, toCatalogFaction)),
      kits: kits.map((stored) => toVersionedEntry(stored, toCatalogKit)),
    };
  }

  async applyImport(catalogImport: CatalogImport): Promise<void> {
    await this.connection.transaction(async (session) => {
      await this.applyUpdate({ model: this.systems, idField: 'systemId' }, catalogImport.systems, session);
      await this.applyUpdate({ model: this.factions, idField: 'factionId' }, catalogImport.factions, session);
      await this.applyUpdate({ model: this.kits, idField: 'kitId' }, catalogImport.kits, session);
      await this.imports.create([{ snapshotHash: catalogImport.snapshotHash }], { session });
    });
  }

  async searchKits(text: string, limit: number): Promise<CatalogKit[]> {
    const contains = new RegExp(escapeRegExp(text), 'i');
    const kits = await this.kits
      .find({
        ...LATEST,
        isRemoved: false,
        // The variants' names find either-or kits by every outcome, e.g. "Burna Boyz" finds Lootas.
        $or: [
          { name: contains },
          { 'variants.name': contains },
          { 'releases.sku': contains },
          { 'releases.barcode': contains },
        ],
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

  /** The previous latest version stays as it is; only its flags move to the new one. */
  private async applyUpdate<T extends { readonly id: string }, D>(
    collection: VersionedCollection<D>,
    update: CatalogUpdate<T>,
    session: ClientSession,
  ): Promise<void> {
    const latestOf = (ids: readonly string[]) => ({ ...LATEST, [collection.idField]: { $in: ids } });
    await collection.model.updateMany(latestOf(update.versions.map(({ entry }) => entry.id)), { isLatest: false }, { session });
    await collection.model.insertMany(
      update.versions.map(({ entry: { id, ...content }, version }) => ({
        ...content,
        [collection.idField]: id,
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
