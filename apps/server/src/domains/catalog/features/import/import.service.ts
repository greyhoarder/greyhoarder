import { Injectable, Logger, type OnApplicationBootstrap } from '@nestjs/common';
import { planCatalogUpdate } from '../../models/catalog-update.js';
import { CatalogRepository } from '../../ports/catalog-repository.js';
import { CatalogSnapshotSource } from '../../ports/catalog-snapshot-source.js';

/** Imports the snapshot of this release on startup, unless it was imported last (ADR-0020). */
@Injectable()
export class ImportService implements OnApplicationBootstrap {
  private readonly logger = new Logger(ImportService.name);

  constructor(
    private readonly snapshots: CatalogSnapshotSource,
    private readonly catalog: CatalogRepository,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.importSnapshot();
  }

  async importSnapshot(): Promise<void> {
    const [snapshot, lastHash] = await Promise.all([this.snapshots.load(), this.catalog.findLastSnapshotHash()]);
    if (snapshot.hash === lastHash) {
      return;
    }
    const imported = await this.catalog.findImported();
    const { skipped } = snapshot;
    // The factions of a system whose file was left out are unknown, so they all keep their version.
    const skippedSystemIds = new Set(skipped.systemIds);
    const keptFactionIds = [
      ...skipped.factionIds,
      ...imported.factions.filter(({ entry }) => skippedSystemIds.has(entry.systemId)).map(({ entry }) => entry.id),
    ];
    const kits = planCatalogUpdate(imported.kits, snapshot.kits, skipped.kitIds);
    await this.catalog.applyImport({
      snapshotHash: snapshot.hash,
      systems: planCatalogUpdate(imported.systems, snapshot.systems, skipped.systemIds),
      factions: planCatalogUpdate(imported.factions, snapshot.factions, keptFactionIds),
      kits,
    });
    this.logger.log(
      `Imported catalog ${snapshot.hash.slice(0, 12)}: ${kits.versions.length} new kit versions, ` +
        `${kits.removedIds.length} removed, ${kits.restoredIds.length} restored, ${skipped.kitIds.length} left out.`,
    );
  }
}
